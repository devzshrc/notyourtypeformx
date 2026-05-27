import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const fontSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
});

const fontMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-space-mono",
});

export const metadata: Metadata = {
    title: "Schema",
    description: "Build beautiful conversational forms with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg">
                    Skip to content
                </a>
                <GlobalProviders>{children}</GlobalProviders>
            </body>
        </html>
    );
}
