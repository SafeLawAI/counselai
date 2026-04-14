import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// All pages use Clerk auth; disable static generation globally
export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexSafe AI — Private Legal Research Assistant",
  description:
    "A privacy-first AI assistant built exclusively for licensed attorneys. Conversations are never stored, never used for training, and protected by architecture — not just policy.",
  keywords: ["legal AI", "attorney research", "privileged AI", "law firm AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
