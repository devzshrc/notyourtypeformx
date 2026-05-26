import { z } from "zod"


export const createUserWithEmailAndPasswordInputModel = z.object(
    {
        fullName: z.string().describe("Name of the user"),
        email: z.email().describe("Email of the user"),
        password: z.string().describe("Password of the user")
    }
)

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user"),
})

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().describe("password of the user")
})

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("ID of the user")
})