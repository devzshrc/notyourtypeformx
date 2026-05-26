import type { Metadata } from "next";
import { Roboto, Playfair_Display, Fira_Code } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const fontSans = Roboto({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontSerif = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
});

const fontMono = Fira_Code({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "notYourTypeForm",
    description: "form generation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}>
                <GlobalProviders>{children}</GlobalProviders>
            </body>
        </html>
    );
}
