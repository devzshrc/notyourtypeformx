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
    logoutInputModel,
    logoutOutputModel,
} from "./model";
import { userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { signInUserWithEmailAndPassword } from "@repo/services/user/model";
const getPath = generatePath("/authentication");
const TAGS = ["Authentication"];

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
            ctx.setCookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
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
            ctx.setCookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            return {
                id,
            };
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
            ctx.clearCookie("token");
            return { success: true };
        }),
});
