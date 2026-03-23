import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Urbanist,
} from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { REDDIT_PIXEL } from "@/lib/analytics/redditPixel";
import { SITE_URL } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OpenSlop - Free Open-Source AI Content Creator",
    template: "%s - OpenSlop",
  },
  description:
    "Free open-source AI video pipeline. Single prompt to finished video for free. No GPU, no manual editing.",
  keywords: [
    "AI video",
    "open source",
    "video creation",
    "automation",
    "YouTube",
    "content creation",
    "text to video",
  ],
  authors: [{ name: "OpenSlop", url: SITE_URL }],
  creator: "OpenSlop",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "OpenSlop",
    title: "OpenSlop - Free Open-Source AI Content Creator",
    description:
      "Free open-source AI video pipeline. Single prompt to finished video for free. No GPU, no manual editing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenSlop - AI Video Creation Pipeline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenSlop - Free Open-Source AI Content Creator",
    description:
      "Free open-source AI video pipeline. Single prompt to finished video for free.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  other: {
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=sentient@400,500,600,700&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="reddit-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: REDDIT_PIXEL,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${urbanist.variable} antialiased bg-background text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
