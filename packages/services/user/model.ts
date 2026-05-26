// zod ke models to define the output for proper validations
import { z } from "zod";
export const createUserWithEmailAndPassword = z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.email().describe("Email of the user"),
    password: z.string().describe("password of the user"),
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
