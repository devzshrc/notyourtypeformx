import type { Metadata } from "next";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

export const metadata: Metadata = {
    title: "ChaiForms",
    description: "Build beautiful forms. Collect responses. Get insights.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="font-sans antialiased">
                <GlobalProviders>{children}</GlobalProviders>
            </body>
        </html>
    );
}
