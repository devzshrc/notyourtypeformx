import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "Schema API",
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

// Security headers. CSP is disabled because this process also serves the Scalar
// API-reference UI at /docs (which loads its own scripts); the embeddable form
// framing is served by the Next.js web app, not this API.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }),
);

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
    return res.json({ message: "Schema API is running" });
});

app.get("/health", (req, res) => {
    return res.json({ message: "Schema server is healthy", healthy: true });
});

app.get("/openapi.json", (req, res) => {
    return res.json(openApiDocument);
});

app.use("/docs", apiReference({ url: "/openapi.json" }));

// AI generation: strict limiter (5/min per IP to prevent abuse)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many AI requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to public submission endpoints
app.use("/api/submission/submitForm", submitLimiter);
app.use("/api/submission/recordEvent", publicApiLimiter);
app.use("/api/submission/verifyFormPassword", publicApiLimiter);
app.use("/api/submission/getPublicForm", publicApiLimiter);
app.use("/api/form/generateForm", aiLimiter);
app.use("/api/form/suggestFields", aiLimiter);

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
