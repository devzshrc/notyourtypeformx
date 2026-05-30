import { initTRPC, TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { userService } from "./services";
import { AppError, type AppErrorCode } from "@repo/services/common/errors";
import { env } from "@repo/services/env";

const isProd = env.NODE_ENV === "production";

export const tRPCContext = initTRPC
    .meta<OpenApiMeta>()
    .context<typeof createContext>()
    .create({
        // Strip internals from anything that reaches the client. Unknown/INTERNAL errors
        // never carry their raw message in production; stack traces are never sent.
        errorFormatter({ shape, error }) {
            const data = { ...shape.data };
            delete (data as { stack?: string }).stack;
            if (isProd && error.code === "INTERNAL_SERVER_ERROR") {
                return { ...shape, message: "Internal server error", data };
            }
            return { ...shape, data };
        },
    });

export const router = tRPCContext.router;

// Map domain AppError codes → tRPC codes (which drive HTTP status at the boundary).
const APP_TO_TRPC: Record<AppErrorCode, TRPC_ERROR_CODE_KEY> = {
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
    INTERNAL: "INTERNAL_SERVER_ERROR",
};

// Converts service-layer AppErrors into properly-coded TRPCErrors. Without this every
// thrown Error collapses into INTERNAL_SERVER_ERROR (HTTP 500), so the client can't tell
// "wrong password" (401) from "email taken" (409) from a real crash.
const errorMapper = tRPCContext.middleware(async ({ next }) => {
    const result = await next();
    if (!result.ok) {
        const cause = result.error.cause;
        if (cause instanceof AppError) {
            throw new TRPCError({
                code: APP_TO_TRPC[cause.code],
                message: cause.expose ? cause.message : "Something went wrong",
                cause,
            });
        }
    }
    return result;
});

// Base procedure: all public procedures get AppError mapping.
const baseProcedure = tRPCContext.procedure.use(errorMapper);

export const publicProcedure = baseProcedure;

//if we use this further anywhere- only authenticated users can reach those routes
export const authenticatedProcedure = baseProcedure.use(async (options) => {
    const { ctx } = options;
    const userToken = ctx.getCookie("token");
    if (!userToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not logged in" });

    let userId: string;
    try {
        const { id } = await userService.verifyAndDecodeUserToken(userToken);
        userId = id;
    } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    }

    // Token can outlive the account (deleted/disabled user keeps a valid 7d JWT). Confirm
    // the subject still exists before granting access.
    const exists = await userService.userExists(userId);
    if (!exists) throw new TRPCError({ code: "UNAUTHORIZED", message: "Account no longer exists" });

    return options.next({
        ctx: {
            ...ctx,
            user: { id: userId },
        },
    });
});
