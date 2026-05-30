import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Google Identity Services **redirect** flow endpoint.
 *
 * On a Google sign-in, GIS does a full-page POST here (application/x-www-form-urlencoded)
 * with a signed ID token (`credential`) and a `g_csrf_token` double-submit value. We:
 *   1. Verify g_csrf_token (body) matches the g_csrf_token cookie GIS set (CSRF defense).
 *   2. Hand the ID token to the API, which verifies it and issues the auth cookie.
 *   3. Forward that auth cookie first-party onto the web domain + set the has_session
 *      marker, then redirect the browser to the original destination.
 *
 * No popup is involved anywhere, so popup blockers / Brave shields cannot break it.
 */

const API_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:8000").replace(/\/+$/, "");
// Match the auth-cookie / JWT lifetime on the API (7 days).
const HAS_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/** Same-origin relative paths only — rejects open-redirect targets. */
function safeRedirect(raw: string | null): string {
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/dashboard";
}

export async function POST(req: Request) {
    const url = new URL(req.url);
    const origin = url.origin;
    const dest = safeRedirect(url.searchParams.get("redirect"));

    const fail = (reason: string) =>
        NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(reason)}`, origin), 303);

    let credential: FormDataEntryValue | null;
    let bodyCsrf: FormDataEntryValue | null;
    try {
        const form = await req.formData();
        credential = form.get("credential");
        bodyCsrf = form.get("g_csrf_token");
    } catch {
        return fail("Google sign-in failed");
    }

    const jar = await cookies();
    const cookieCsrf = jar.get("g_csrf_token")?.value;

    // CSRF: GIS sets g_csrf_token as a cookie AND posts it in the body; they must match.
    if (typeof bodyCsrf !== "string" || !bodyCsrf || bodyCsrf !== cookieCsrf) {
        return fail("Google sign-in failed");
    }
    if (typeof credential !== "string" || !credential) {
        return fail("Google sign-in failed");
    }

    // Verify + upsert via the API. Server-to-server (no Origin header) so it passes the
    // API's CORS/CSRF checks. The API responds with the auth cookie in Set-Cookie.
    let apiRes: Response;
    try {
        apiRes = await fetch(`${API_TARGET}/api/authentication/signInWithGoogle`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ idToken: credential }),
        });
    } catch {
        return fail("Google sign-in failed");
    }
    if (!apiRes.ok) return fail("Google sign-in failed");

    const res = NextResponse.redirect(new URL(dest, origin), 303);
    // The API's auth cookie is host-only (no Domain) → re-emitting it on this response
    // rebinds it first-party to the web domain.
    for (const setCookie of apiRes.headers.getSetCookie()) {
        res.headers.append("set-cookie", setCookie);
    }
    // Session marker so Next middleware allows /dashboard.
    res.cookies.set("has_session", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: HAS_SESSION_MAX_AGE,
    });
    return res;
}
