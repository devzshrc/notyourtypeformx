// service ka logic

import {
    createUserWithEmailAndPassword,
    type CreateUserWithEmailAndPassword,
    generateUserTokenPayload,
    type GenerateUserTokenPayloadType,
    signInUserWithEmailAndPassword,
    type SignInUserWithEmailAndPasswordType,
    signInWithGoogle,
    type SignInWithGoogleType,
    DUMMY_BCRYPT_HASH,
} from "./model";
import { usersTable } from "@repo/database/models/user";
import { db, eq } from "@repo/database";
import bcrypt from "bcryptjs";
import * as JWT from "jsonwebtoken";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { env } from "../env";
import { sendEmail } from "../common/email";
import { welcomeEmail } from "../common/email-templates";
import { ConflictError, NotFoundError, UnauthorizedError } from "../common/errors";

/** Postgres unique-constraint violation (SQLSTATE 23505), however the driver surfaces it. */
function isUniqueViolation(e: unknown): boolean {
    if (typeof e !== "object" || e === null) return false;
    const code = (e as { code?: unknown }).code;
    if (code === "23505") return true;
    const msg = (e as { message?: unknown }).message;
    return typeof msg === "string" && /duplicate key|unique constraint/i.test(msg);
}
export default class UserService {
    //getUserByEmail
    private async getUserByEmail(email: string) {
        const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
        //checking lenght - bcuz drizzly by default reeturns an array
        if (!result || result.length === 0) return null;
        return result[0];
    }
    //create token
    private async generateUserToken(payload: GenerateUserTokenPayloadType) {
        const { id } = await generateUserTokenPayload.parseAsync(payload);
        // 7d: stateless JWT has no server-side revocation, so keep the blast radius
        // of a leaked token small. Keep in sync with AUTH_COOKIE_OPTIONS.maxAge and
        // the has_session marker maxAge on the web app.
        const token = JWT.sign({ id }, env.JWT_SECRET, { expiresIn: "7d" });
        return { token };
    }

    public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPassword) {
        //pseudocode
        //data receive and validate
        //check in DB if this email already exits
        //hash the password
        // if not: create a new user in DB
        //jwt token , we will set it in cookie
        //return
        const parsed = await createUserWithEmailAndPassword.parseAsync(payload);
        const fullName = parsed.fullName.trim();
        // Normalize email so lookups, dedupe and the welcome idempotencyKey are
        // case-insensitive and match the Google path (which also lowercases).
        const email = parsed.email.trim().toLowerCase();
        const { password } = parsed;
        //parseAsync is a funcationality of zod that validates for us
        // Fast-path friendly check. The unique index on `email` is the real guard — two
        // concurrent signups both pass this check, so the DB constraint (caught below)
        // is what actually prevents duplicate accounts (race-safe).
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) throw new ConflictError("An account with this email already exists");
        const passwordHash = await bcrypt.hash(password, 12);
        let result;
        try {
            result = await db
                .insert(usersTable)
                .values({
                    fullName,
                    email,
                    passwordHash,
                })
                .returning({ id: usersTable.id });
        } catch (e) {
            if (isUniqueViolation(e)) throw new ConflictError("An account with this email already exists");
            throw e;
        }
        if (!result || result.length === 0 || !result[0]?.id) {
            throw new Error("something went wrong while creating a new user");
        }
        // token generate
        const { token } = await this.generateUserToken({ id: result[0].id });

        // Welcome email — fire-and-forget, never blocks signup.
        const { subject, html } = welcomeEmail({ name: fullName, url: `${env.WEB_URL}/dashboard` });
        void sendEmail({ to: email, subject, html, idempotencyKey: `welcome/${result[0].id}` });

        return {
            id: result[0].id,
            token,
        };
    }

    public async signInWithGoogle(payload: SignInWithGoogleType) {
        const { idToken } = await signInWithGoogle.parseAsync(payload);
        if (!env.GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured");

        // Verify the ID token signature AND that its audience is OUR client id (rejects a
        // token minted for another app — the "confused deputy" attack). google-auth-library
        // fetches and caches Google's signing keys and checks exp/iss for us.
        const oauthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
        let ticketPayload: TokenPayload | undefined;
        try {
            const ticket = await oauthClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
            ticketPayload = ticket.getPayload();
        } catch {
            throw new UnauthorizedError("Invalid Google credential");
        }
        if (!ticketPayload?.sub) throw new UnauthorizedError("Invalid Google profile");
        if (!ticketPayload.email || ticketPayload.email_verified !== true) {
            throw new UnauthorizedError("Google account email is not verified");
        }

        const googleId = ticketPayload.sub;
        const email = ticketPayload.email.toLowerCase();
        const fullName = ticketPayload.name || email.split("@")[0]!;
        const avatarUrl = ticketPayload.picture ?? null;

        // 1) Existing Google-linked account → sign in.
        const byGoogle = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
        if (byGoogle?.[0]) {
            const { token } = await this.generateUserToken({ id: byGoogle[0].id });
            return { id: byGoogle[0].id, token };
        }

        // 2) Same email already registered (password account) → link Google to it.
        //    Safe because Google asserted email_verified.
        const existing = await this.getUserByEmail(email);
        if (existing) {
            await db
                .update(usersTable)
                .set({ googleId, avatarUrl: existing.avatarUrl ?? avatarUrl, emailVerified: existing.emailVerified ?? new Date() })
                .where(eq(usersTable.id, existing.id));
            const { token } = await this.generateUserToken({ id: existing.id });
            return { id: existing.id, token };
        }

        // 3) New user → create (no password, provider = google).
        const result = await db
            .insert(usersTable)
            .values({ fullName, email, googleId, avatarUrl, emailVerified: new Date(), authProvider: "google" })
            .returning({ id: usersTable.id });
        if (!result?.[0]?.id) throw new Error("something went wrong while creating a new user");

        const { token } = await this.generateUserToken({ id: result[0].id });
        const welcome = welcomeEmail({ name: fullName, url: `${env.WEB_URL}/dashboard` });
        void sendEmail({ to: email, subject: welcome.subject, html: welcome.html, idempotencyKey: `welcome/${result[0].id}` });

        return { id: result[0].id, token };
    }

    public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordType) {
        const parsed = await signInUserWithEmailAndPassword.parseAsync(payload);
        const email = parsed.email.trim().toLowerCase();
        const { password } = parsed;

        // Generic error for every failure mode (no such user / OAuth-only account /
        // wrong password) to prevent account enumeration. Run a bcrypt compare even
        // when the user is missing to flatten the timing side-channel.
        const existingUser = await this.getUserByEmail(email);
        const hash = existingUser?.passwordHash ?? DUMMY_BCRYPT_HASH;
        const isValid = await bcrypt.compare(password, hash);
        if (!existingUser || !existingUser.passwordHash || !isValid) {
            throw new UnauthorizedError("Invalid email or password");
        }
        const { token } = await this.generateUserToken({ id: existingUser.id });

        return {
            id: existingUser.id,
            token,
        };
    }

    public async getUserInfoById(id: string) {
        const user = await db
            .select({
                id: usersTable.id,
                fullName: usersTable.fullName,
                email: usersTable.email,
            })
            .from(usersTable)
            .where(eq(usersTable.id, id));
        if (!user || user.length === 0) {
            throw new NotFoundError("User with this ID does not exist");
        }
        return user[0]!;
    }

    /** Cheap existence check (indexed PK) used by authenticatedProcedure each request. */
    public async userExists(id: string): Promise<boolean> {
        const rows = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);
        return rows.length > 0;
    }

    public async verifyAndDecodeUserToken(token: string) {
        try {
            const result = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType;
            return result;
        } catch {
            throw new Error("Invalid token");
        }
    }
}
