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
import { env } from "@repo/services/env";
import type { CookieOptions } from "express";

const getPath = generatePath("/authentication");
const TAGS = ["Authentication"];

const isProd = env.NODE_ENV === "production";

// SameSite=None mandates Secure (browsers reject otherwise). Force it on when the
// deployment is cross-site, regardless of NODE_ENV.
const sameSite = env.COOKIE_SAMESITE;
const secure = isProd || sameSite === "none";

// 7d — matches the JWT lifetime in user/index.ts and the web has_session marker.
const AUTH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const AUTH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    domain: env.COOKIE_DOMAIN,
    path: "/",
    maxAge: AUTH_MAX_AGE_MS,
};

// Same attributes minus maxAge — must match for the browser to clear the cookie.
const CLEAR_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    domain: env.COOKIE_DOMAIN,
    path: "/",
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
    // Public so an expired/invalid session can still clear its cookie — a logout
    // gated behind authentication can't sign out a user whose token already lapsed.
    logout: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/logout"),
                tags: TAGS,
            },
        })
        .input(logoutInputModel)
        .output(logoutOutputModel)
        .mutation(async ({ ctx }) => {
            ctx.clearCookie("token", CLEAR_COOKIE_OPTIONS);
            return { success: true };
        }),
});
