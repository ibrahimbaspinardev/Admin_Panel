import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pro-admin-panel.local"),
  title: {
    default: "Pro Paket Admin Panel",
    template: "%s | Pro Paket Admin Panel",
  },
  description:
    "Firebase, Firestore, role based auth, live metrics, user management, uploads and audit logs for a production-ready SaaS admin panel.",
  keywords: [
    "admin panel",
    "saas dashboard",
    "firebase admin",
    "firestore",
    "nextjs",
  ],
  authors: [{ name: "Pro Paket" }],
  openGraph: {
    title: "Pro Paket Admin Panel",
    description: "Production-ready SaaS dashboard with Firebase and role based access.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#070a12] font-sans">{children}</body>
    </html>
  );
}
