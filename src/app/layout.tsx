import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipBoard — Barber Booking Platform",
  description: "The modern booking and business platform built for barbershops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
