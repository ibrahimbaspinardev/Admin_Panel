import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Pro Paket Admin Panel",
  description: "Advanced admin panel package built with Next.js.",
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
