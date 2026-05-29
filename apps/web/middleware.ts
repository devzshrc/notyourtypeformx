import { NextResponse, type NextRequest } from "next/server";

// UX gate only — checks for a lightweight session marker cookie set on the web domain
// (via /api/auth/session). Real auth is enforced server-side by authenticatedProcedure.
// The marker is set after any successful login and cleared on logout.
const SESSION_COOKIE = "has_session";

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

    if (!hasSession) {
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
