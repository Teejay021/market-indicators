import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Indicators",
  description: "Market indices with 30-day detail views",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
