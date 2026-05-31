import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Zen_Kaku_Gothic_New } from "next/font/google";
import "@cloudflare/kumo/styles";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const fontSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

// Editorial display serif for the marketing surface (ukiyo-e / paper aesthetic).
const fontDisplay = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
    axes: ["opsz", "SOFT", "WONK"],
});

// Zen Kaku Gothic New — Japanese-designed gothic; app-wide UI font everywhere
// except landing. Renders the kanji motifs natively. preload:false since the
// full JP glyph set is large.
const fontApp = Zen_Kaku_Gothic_New({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-app-src",
    display: "swap",
    preload: false,
});

export const metadata: Metadata = {
    title: "Schema · 書式",
    description: "AI-native form builder — describe a form in one sentence, ship it in seconds. 考えを、ひとことで。",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} ${fontApp.variable} font-app antialiased`} suppressHydrationWarning>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg">
                    Skip to content
                </a>
                <GlobalProviders>{children}</GlobalProviders>
            </body>
        </html>
    );
}
