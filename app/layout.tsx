import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-stack",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Akash Hangar — interactive 3D Indian Air Force aircraft",
    template: "%s · Akash Hangar",
  },
  description:
    "Explore Indian Air Force aircraft as interactive 3D models, with specifications and history drawn from publicly available sources. An independent, non-commercial educational project.",
  keywords: [
    "Indian Air Force",
    "IAF aircraft",
    "3D aircraft models",
    "Su-30MKI",
    "Tejas",
    "Rafale",
    "aviation",
  ],
  openGraph: {
    type: "website",
    siteName: "Akash Hangar",
    title: "Akash Hangar — interactive 3D Indian Air Force aircraft",
    description:
      "Interactive 3D models, specifications and history for the aircraft of the Indian Air Force.",
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akash Hangar",
    description:
      "Interactive 3D models, specifications and history for the aircraft of the Indian Air Force.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sky-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-950"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        {/* Renders the mandatory independence disclaimer on every route. */}
        <SiteFooter />
      </body>
    </html>
  );
}
