import type { Metadata } from "next";
import React from "react";
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
  title: "Singularity 2026",
  description:
    "Singularity Hack is a 36-hour national inter-college hackathon bringing together the brightest minds to build, compete, and connect. Register now — Aug 15–17, 2026.",
  keywords: ["hackathon", "singularity hack", "college hackathon", "India hackathon", "coding competition"],
  openGraph: {
    title: "Singularity 2026",
    description: "36 hours. 4 tracks. ₹1,00,000+ in prizes. Are you ready?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white font-sans">
        {/* Global dot-grid background — visible site-wide */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, rgba(200,241,53,0.08) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
