// Single transactional-email entry point for all services.
//
// Design rules:
// - Resend's Node SDK returns { data, error } and does NOT throw — we check `error`.
// - Sending must NEVER break the request that triggered it. Callers fire-and-forget;
//   this module also swallows/logs its own failures.
// - When RESEND_API_KEY is unset (local dev, tests) we log instead of sending, so the
//   app works end-to-end without a key.
import { Resend } from "resend";
import { env } from "../env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// One boot-time warning instead of a per-send log, so a missing key is obvious in
// prod startup logs rather than buried in request noise.
if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — all emails will be skipped (logged only).");
} else if (env.EMAIL_FROM.includes("onboarding@resend.dev")) {
    // Sandbox sender only delivers to the Resend account owner; every other recipient
    // is silently rejected. Loud at boot so this isn't mistaken for "emails not sending".
    console.warn(
        "[email] EMAIL_FROM uses the Resend sandbox sender (onboarding@resend.dev) — " +
            "mail will ONLY reach the Resend account owner. Verify a domain and set EMAIL_FROM to fix.",
    );
}

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    /** Stable key so retries don't double-send. Format: `<event>/<entity-id>`. */
    idempotencyKey?: string;
    replyTo?: string;
}

/**
 * Send a transactional email. Resolves to `{ id }` on success or `null` on
 * skip/failure. Never throws — safe to `await` inside a mutation without a try/catch.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<{ id: string } | null> {
    const { to, subject, html, idempotencyKey, replyTo } = opts;

    if (!resend) {
        console.warn(`[email skipped — no RESEND_API_KEY] "${subject}" → ${Array.isArray(to) ? to.join(", ") : to}`);
        return null;
    }

    try {
        const { data, error } = await resend.emails.send(
            { from: env.EMAIL_FROM, to, subject, html, ...(replyTo ? { replyTo } : {}) },
            idempotencyKey ? { idempotencyKey } : undefined,
        );
        if (error) {
            // Surface name + recipient so restricted-sender / validation failures are
            // greppable. The shared `onboarding@resend.dev` sender only delivers to the
            // Resend account owner — verify a real domain and set EMAIL_FROM to fix.
            const dest = Array.isArray(to) ? to.join(", ") : to;
            console.error(`[email failed] "${subject}" → ${dest} [${error.name}]: ${error.message}`);
            return null;
        }
        return data ? { id: data.id } : null;
    } catch (err) {
        // Network/unexpected — log, never propagate into the caller's request.
        console.error(`[email error] "${subject}":`, err);
        return null;
    }
}
