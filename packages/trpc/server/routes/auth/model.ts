import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().min(1).max(100).describe("Name of the user"),
    email: z.email().describe("Email of the user"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password is too long")
        .describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().min(1).max(128).describe("password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user"),
});

export const getLoggedInUserInfoInputModel = z.object({}).optional();

export const getLoggedInUserInfoOutputModel = z.object({
    id: z.string().describe("ID of the user"),
    fullName: z.string().describe("Name of the user"),
    email: z.email().describe("Email of the user"),
});

export const logoutInputModel = z.object({}).optional();
export const logoutOutputModel = z.object({ success: z.boolean() });
