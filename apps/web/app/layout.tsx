import type { Metadata } from "next";
import { Familjen_Grotesk } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen-grotesk",
});

export const metadata: Metadata = {
  title: "Streamyst",
  description: "Media Forwarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={familjenGrotesk.className}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
