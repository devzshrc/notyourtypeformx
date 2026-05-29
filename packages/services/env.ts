import { z } from "zod";

const envSchema = z.object({
    JWT_SECRET: z.string().describe("Secret key for JWT tokens"),
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
