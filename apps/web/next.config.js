/**
 * Internal API origin the Next server proxies to. Server-side only (NOT NEXT_PUBLIC),
 * so the browser never talks to the API cross-site — it talks to this Next origin at
 * /trpc, which rewrites to the API. That keeps the auth cookie FIRST-PARTY on the web
 * domain (SameSite=Lax works in every browser, incl. Safari/Firefox). Must NOT include
 * a trailing /trpc — the rewrite appends it.
 */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:8000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ protocol: "https", hostname: "robohash.org" }],
    },
    async rewrites() {
        // Browser → /trpc/* (same-origin) → API /trpc/*. Next forwards request cookies
        // and the API's Set-Cookie back through, stored first-party for the web domain.
        return [
            { source: "/trpc/:path*", destination: `${API_PROXY_TARGET}/trpc/:path*` },
        ];
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
                ],
            },
        ];
    },
};

export default nextConfig;
