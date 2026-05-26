import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import rateLimit from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "ChaiForms API",
    version: "1.0.0",
    baseUrl: env.BASE_URL.concat("/api"),
});

// Rate limiters
const publicApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const submitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many submissions, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// cors config
app.use(
    cors({
        origin: env.WEB_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    return res.json({ message: "ChaiForms API is running" });
});

app.get("/health", (req, res) => {
    return res.json({ message: "ChaiForms server is healthy", healthy: true });
});

app.get("/openapi.json", (req, res) => {
    return res.json(openApiDocument);
});

app.use("/docs", apiReference({ url: "/openapi.json" }));

// Apply rate limiting to public submission endpoints
app.use("/api/submission/submitForm", submitLimiter);
app.use("/api/submission/recordEvent", publicApiLimiter);
app.use("/api/submission/verifyFormPassword", publicApiLimiter);
app.use("/api/submission/getPublicForm", publicApiLimiter);

app.use(
    "/api",
    createOpenApiExpressMiddleware({
        router: serverRouter,
        createContext,
    }),
);

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
        router: serverRouter,
        createContext,
    }),
);

export default app;
