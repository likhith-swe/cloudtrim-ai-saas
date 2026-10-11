import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import GlobalModals from "@/components/GlobalModals";
import Navigation from "@/components/Navigation";
import OpenPricingCta from "@/components/OpenPricingCta";
import SmoothScroll from "@/components/SmoothScroll";
import { ENV } from "@/lib/env";
import { jsonLdProduct, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "CloudTrim AI — FinOps Cloud Waste & Zombie Resource Radar",
    template: "%s · CloudTrim AI",
  },
  description:
    "Detect idle compute, unattached EBS volumes, zombie NAT gateways and cost leaks in real time. WasteScore 0-100, exact $/hr waste, 1-click Terraform + CLI fixes, Slack/Telegram/WhatsApp alerts.",
  keywords: [
    "FinOps",
    "cloud cost optimization",
    "AWS waste scanner",
    "zombie resources",
    "Terraform remediation",
    "cloud spend radar",
  ],
  applicationName: "CloudTrim AI",
  openGraph: {
    title: "CloudTrim AI — FinOps Cloud Waste Radar",
    description:
      "Teams waste 25-40% of their cloud budget on zombies. CloudTrim finds them, scores them, and hands you the fix.",
    url: siteUrl(),
    siteName: "CloudTrim AI",
    type: "website",
    images: [
      {
        url: "/api/og?waste=869500&score=87&label=CLOUD%20WASTE%20DETECTED",
        width: 1200,
        height: 630,
        alt: "CloudTrim AI waste radar certificate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudTrim AI — FinOps Cloud Waste Radar",
    description:
      "Real-time WasteScore, $/hr leak accounting and 1-click Terraform fixes for zombie cloud resources.",
    images: ["/api/og?waste=869500&score=87"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body className="bg-[#08090d] font-sans text-white antialiased selection:bg-white/20 selection:text-white">
        <SmoothScroll />
        <GlobalModals>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <OpenPricingCta />
        </GlobalModals>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct()) }}
        />
        {ENV.siteUrl.includes("localhost") ? null : null}
      </body>
    </html>
  );
}
