import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareSync Real-Time Patient System",
  description: "Real-time collaborative patient registration and telemetry system",
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
