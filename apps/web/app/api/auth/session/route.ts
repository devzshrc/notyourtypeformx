import { cookies } from "next/headers";

/**
 * Session marker — sets or clears a lightweight cookie on the web domain so that
 * Next.js middleware can gate /dashboard without needing access to the cross-origin
 * API auth cookie. This is a UX flag only; real auth is enforced server-side by
 * authenticatedProcedure (JWT verification on the API).
 */

const COOKIE_NAME = "has_session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches JWT expiry

export async function POST() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return Response.json({ ok: true });
}
