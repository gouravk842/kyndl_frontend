import "./globals.css";

import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Dancing_Script,
  EB_Garamond,
  Geist_Mono,
  Plus_Jakarta_Sans,
  Syne,
} from "next/font/google";

import { createMetadata } from "@/lib/seo";
import { AppProviders } from "@/providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Scrapbook handwriting voices: Caveat for casual notes, Dancing Script for
// flowing cursive love-letter passages.
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  display: "swap",
});

// Constellation: a classical serif for star labels and memory text — starlight
// in type. Loaded with its italic so the constellation name can whisper.
const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${syne.variable} ${geistMono.variable} ${caveat.variable} ${dancingScript.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
