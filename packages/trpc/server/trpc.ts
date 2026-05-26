import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { userService } from "./services";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

//if we use this firther anythwhre- only autheticated users can reach those routes
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
    const { ctx } = options;
    const userToken = ctx.getCookie("token");
    if (!userToken) throw new Error("User is not logged in");
    const { id } = await userService.verifyAndDecodeUserToken(userToken);
    return options.next({
        ctx: {
            ...ctx,
            user: { id },
        },
    });
});
