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

// Trust reverse proxy (needed in production for secure cookies behind TLS termination,
// and so express-rate-limit keys on the real client IP from X-Forwarded-For).
app.set("trust proxy", 1);

const openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "Schema API",
    version: "1.0.0",
    baseUrl: env.BASE_URL.concat("/api"),
});

// ── Rate limiters ──
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

// AI generation: strict limiter (5/min per IP to prevent abuse)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many AI requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Credential limiter: brute-force / signup-spam defense. The web client talks to
// /trpc (not /api), so this MUST cover that path or it is dead weight.
// skipSuccessfulRequests => only failed attempts count toward the limit.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { error: "Too many attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const isAuthPath = (p: string) =>
    /(createUserWithEmailAndPassword|signInUserWithEmailAndPassword)/.test(p);

// Security headers. CSP is disabled because this process also serves the Scalar
// API-reference UI at /docs (which loads its own scripts); the embeddable form
// framing is served by the Next.js web app, not this API.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }),
);

// Trusted web origins. WEB_URL may be a comma-separated list (prod + preview deploys).
// Requests with no Origin (server-to-server, curl, the Next proxy on some methods) are
// allowed; a present Origin must be on the allowlist.
const ALLOWED_ORIGINS = new Set(
    env.WEB_URL.split(",").map((o) => o.trim()).filter(Boolean),
);

// cors config
app.use(
    cors({
        origin(origin, cb) {
            if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
            return cb(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

// CSRF defense (defense-in-depth alongside the SameSite cookie attribute). For
// state-changing methods a browser always attaches an Origin header on cross-site
// requests; reject any that doesn't match the trusted web origin. Requests with no
// Origin (server-to-server / same-origin tools) are not CSRF-exploitable, so pass.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
app.use((req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get("origin");
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return res.status(403).json({ error: "Cross-origin request blocked" });
    }
    next();
});

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

// ── Per-endpoint rate limiting (registered after CORS so 429s carry CORS headers) ──

// Credential endpoints — cover BOTH transports: the web app's tRPC calls and REST.
app.use("/trpc", (req: express.Request, res: express.Response, next: express.NextFunction) =>
    isAuthPath(req.path) ? authLimiter(req, res, next) : next(),
);
app.use("/api/authentication", authLimiter);

// Public submission + AI endpoints.
app.use("/api/submission/submitForm", submitLimiter);
app.use("/api/submission/recordEvent", publicApiLimiter);
app.use("/api/submission/verifyFormPassword", publicApiLimiter);
app.use("/api/submission/getPublicForm", publicApiLimiter);
app.use("/api/form/generateForm", aiLimiter);
app.use("/api/form/suggestFields", aiLimiter);

// Global floor for the whole tRPC surface (the web client's only transport).
app.use("/trpc", publicApiLimiter);

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
