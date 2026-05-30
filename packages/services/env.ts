import { z } from "zod";

const envSchema = z.object({
    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters — generate with `openssl rand -base64 48`")
        .describe("Secret key for JWT tokens"),
    // Cookie SameSite topology. "lax" when API+web share a registrable domain (no
    // cross-site CSRF surface); "none" only for true cross-site (requires Secure).
    COOKIE_SAMESITE: z.enum(["lax", "none", "strict"]).default("lax").describe("Auth cookie SameSite policy"),
    // Optional parent domain for cross-subdomain cookie sharing, e.g. ".example.com".
    // Empty string → undefined so the cookie stays host-only (no invalid `Domain=`).
    COOKIE_DOMAIN: z
        .string()
        .optional()
        .transform((v) => (v && v.trim() !== "" ? v : undefined))
        .describe("Auth cookie Domain attribute"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Email (Resend). Optional — when unset, emails are logged instead of sent so local dev works.
    RESEND_API_KEY: z.string().optional().describe("Resend API key for transactional email"),
    EMAIL_FROM: z.string().default("Schema <onboarding@resend.dev>").describe("Default From address"),
    WEB_URL: z.string().default("http://localhost:3000").describe("Public web app URL, used to build links in emails"),
    // Google OAuth. Optional — when unset, Google sign-in is disabled.
    GOOGLE_CLIENT_ID: z.string().optional().describe("Google OAuth web client ID, used to verify ID tokens"),
});

function createEnv(env: NodeJS.ProcessEnv) {
    const safeParseResult = envSchema.safeParse(env);
    if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
    return safeParseResult.data;
}

export const env = createEnv(process.env);
