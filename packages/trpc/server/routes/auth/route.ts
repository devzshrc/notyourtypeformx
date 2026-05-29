// trpc context -> like a middleware
//nextj frotnend ----> req----> express server(access to req,res) -----forward ----> trpc procedures
// business logic aint implemnted on express
// since cookie come at express - how do we set it in trpc bcuz in trpc we dont have access to req,res-
// context : we can pass(req,res) from express to trpc with the use of context
// context - built in funcaitonality in trpc library
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import {
    createUserWithEmailAndPasswordInputModel,
    createUserWithEmailAndPasswordOutputModel,
    getLoggedInUserInfoInputModel,
    getLoggedInUserInfoOutputModel,
    signInUserWithEmailAndPasswordInputModel,
    signInUserWithEmailAndPasswordOutputModel,
    signInWithGoogleInputModel,
    signInWithGoogleOutputModel,
    logoutInputModel,
    logoutOutputModel,
} from "./model";
import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { signInUserWithEmailAndPassword } from "@repo/services/user/model";
import type { CookieOptions } from "express";

const getPath = generatePath("/authentication");
const TAGS = ["Authentication"];

const isProd = process.env.NODE_ENV === "production";

const AUTH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

// url will be seen like /authentication/createUserWithEmailAndPassword

export const authRouter = router({
    createUserWithEmailAndPassword: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createUserWithEmailAndPassword"),
                tags: TAGS,
            },
        })
        .input(createUserWithEmailAndPasswordInputModel)
        .output(createUserWithEmailAndPasswordOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { fullName, email, password } = input;

            const { id, token } = await userService.createUserWithEmailAndPassword({
                fullName,
                email,
                password,
            });
            ctx.setCookie("token", token, AUTH_COOKIE_OPTIONS);
            return {
                id,
            };
        }),

    signInUserWithEmailAndPassword: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/signInUserWithEmailAndPassword"),
                tags: TAGS,
            },
        })
        .input(signInUserWithEmailAndPasswordInputModel)
        .output(signInUserWithEmailAndPasswordOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { email, password } = input;

            const { id, token } = await userService.signInUserWithEmailAndPassword({
                email,
                password,
            });
            ctx.setCookie("token", token, AUTH_COOKIE_OPTIONS);
            return {
                id,
            };
        }),
    signInWithGoogle: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/signInWithGoogle"),
                tags: TAGS,
            },
        })
        .input(signInWithGoogleInputModel)
        .output(signInWithGoogleOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { id, token } = await userService.signInWithGoogle({ accessToken: input.accessToken });
            ctx.setCookie("token", token, AUTH_COOKIE_OPTIONS);
            return { id };
        }),
    getLoggedInUserInfo: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getLoggedInUserInfo"),
                tags: TAGS,
            },
        })
        .input(getLoggedInUserInfoInputModel)
        .output(getLoggedInUserInfoOutputModel)
        .query(async ({ ctx }) => {
            const user = await userService.getUserInfoById(ctx.user!.id);
            return user;
        }),
    logout: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/logout"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(logoutInputModel)
        .output(logoutOutputModel)
        .mutation(async ({ ctx }) => {
            ctx.clearCookie("token", {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
                path: "/",
            });
            return { success: true };
        }),
});
