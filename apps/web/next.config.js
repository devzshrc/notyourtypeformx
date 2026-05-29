/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ protocol: "https", hostname: "robohash.org" }],
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
