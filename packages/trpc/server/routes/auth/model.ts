import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe("Name of the user"),
    email: z.email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().describe("password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user"),
});

export const signInWithGoogleInputModel = z.object({
    accessToken: z.string().min(1).describe("Google OAuth access token from the client"),
});

export const signInWithGoogleOutputModel = z.object({
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
