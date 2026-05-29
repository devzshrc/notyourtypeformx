import { NextResponse, type NextRequest } from "next/server";

// Auth cookie set by the API (see packages/trpc/server/routes/auth/route.ts -> ctx.setCookie("token", ...)).
const AUTH_COOKIE = "token";

// Routes that require a session. Everything else is public.
const PROTECTED_PREFIXES = ["/dashboard"];

// NOTE: this is a UX gate only — it checks for the *presence* of the auth cookie,
// not its validity (JWT verification stays server-side in `authenticatedProcedure`).
// Because presence != validity, we do NOT redirect away from /signin or /signup here:
// a stale/expired cookie would otherwise bounce a logged-out user signin -> dashboard,
// and the dashboard layout (which validates via getLoggedInUserInfo) would bounce them
// back to signin — an infinite loop. The signin/signup pages already redirect a *valid*
// session to the dashboard client-side. So middleware only guards protected routes.
//
// In production the cookie must be readable on the web origin: deploy web + API under
// a shared parent domain and set the cookie `Domain=.yourdomain.com`, otherwise the
// browser won't expose the API-domain cookie to this middleware.
export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const hasSession = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

    const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (isProtected && !hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/signin";
        url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
