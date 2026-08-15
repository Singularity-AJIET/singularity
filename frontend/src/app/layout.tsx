/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

const siteName = "Singularity 2026";
const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Singularity 2026 | National Level Hackathon",
    template: "%s | Singularity 2026",
  },
  description:
    "Singularity Hack is a 24-hour national inter-college hackathon bringing together the brightest minds to build, compete, and connect. Happening Sep 17-18, 2026. Register now.",
  alternates: {
    canonical: "/",
  },

  keywords: ["Hackathon", "Singularity hack", "Singularity 2026", "Inter-college hackathon", "National Level hackathon", "24-hour hackathon","Tech competition", "Student innovation", "Hackathon registration"],
  applicationName: siteName,
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Singularity 2026 | National Level Hackathon",
    description: "24 hours. 3 tracks. Sep 17-18, 2026. Join the ultimate inter-college hackathon and showcase your skills.",
    type: "website",
    url: siteUrl,
    siteName,
    locale: "en_IN",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Singularity 2026 Hackathon",
      },
    ],
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
