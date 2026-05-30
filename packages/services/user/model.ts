// zod ke models to define the output for proper validations
import { z } from "zod";

// Precomputed cost-12 bcrypt hash compared against when an account is missing, so
// signin timing does not leak whether an email exists. The plaintext is irrelevant.
export const DUMMY_BCRYPT_HASH = "$2b$12$xD4LvV3EVNHPdfj542VNmuIL3./ThTlzAcyr.SUXUavDhzj3JA4WO";

export const createUserWithEmailAndPassword = z.object({
    fullName: z.string().min(1).max(100).describe("Full name of the user"),
    email: z.email().describe("Email of the user"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password is too long")
        .describe("password of the user"),
});
export type CreateUserWithEmailAndPassword = z.infer<typeof createUserWithEmailAndPassword>;

export const generateUserTokenPayload = z.object({
    id: z.string().describe("ID of the user"),
});
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;

export const signInUserWithEmailAndPassword = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
});
export type SignInUserWithEmailAndPasswordType = z.infer<typeof signInUserWithEmailAndPassword>;

export const signInWithGoogle = z.object({
    idToken: z.string().min(1).describe("Google ID token (credential JWT) from the web client"),
});
export type SignInWithGoogleType = z.infer<typeof signInWithGoogle>;
