import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Temel Paket Admin Panel",
  description: "Basic admin panel package built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
