// service ka logic

import {
    createUserWithEmailAndPassword, type CreateUserWithEmailAndPassword,
    generateUserTokenPayload,
    type GenerateUserTokenPayloadType
} from "./model"
import { usersTable } from "@repo/database/models/user"
import { db, eq } from "@repo/database"
import bcrypt from "bcryptjs";
import * as JWT from "jsonwebtoken";
import { env } from "../env"
export default class UserService {
    //getUserByEmail
    private async getUserByEmail(email: string) {
        const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
        //checking lenght - bcuz drizzly by default reeturns an array
        if (!result || result.length === 0) return null;
        return result[0];
    }
    //create token
    private async generateUserToken(payload: GenerateUserTokenPayloadType) {
        const { id } = await generateUserTokenPayload.parseAsync(payload);
        const token = JWT.sign({ id }, env.JWT_SECRET);
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
        const { fullName, email, password } = await createUserWithEmailAndPassword.parseAsync(payload);
        //parseAsync is a funcationality of zod that validates for us
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) throw new Error("User with this email already exists")
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await db.insert(usersTable).values(
            {
                fullName,
                email,
                passwordHash
            }
        ).returning({ id: usersTable.id });
        if (!result || result.length === 0 || !result[0]?.id) {
            throw new Error("something went wrong while creating a new user")
        }
        // token generate
        const { token } = await this.generateUserToken({ id: result[0].id })
        return {
            id: result[0].id,
            token
        }
    }
}