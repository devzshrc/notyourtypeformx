// Typed application errors. The service layer throws these in DOMAIN language and stays
// HTTP-agnostic; the tRPC boundary (server/trpc.ts) maps `code` → a TRPCError code →
// the right HTTP status. This is why a wrong password becomes 401 and a duplicate email
// becomes 409 instead of every failure collapsing into a generic 500.

export type AppErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "TOO_MANY_REQUESTS"
    | "INTERNAL";

export class AppError extends Error {
    readonly code: AppErrorCode;
    /** When false the message is internal-only and must be masked before reaching a client. */
    readonly expose: boolean;

    constructor(code: AppErrorCode, message: string, expose = true) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.expose = expose;
        // Restore prototype chain so `instanceof` works across the compiled output.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Invalid request") {
        super("BAD_REQUEST", message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Not authenticated") {
        super("UNAUTHORIZED", message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Not allowed") {
        super("FORBIDDEN", message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super("NOT_FOUND", message);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Already exists") {
        super("CONFLICT", message);
    }
}
