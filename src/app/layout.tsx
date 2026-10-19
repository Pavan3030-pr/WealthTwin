import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthTwin — Your living digital finance twin",
  description:
    "An AI-powered financial digital twin that forecasts cashflow stress, explains your money health, simulates decisions and teaches with your own numbers. Synthetic data demo built for Mochavate by Mochatrade.",
};

export const viewport: Viewport = { themeColor: "#f7f8fa", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
