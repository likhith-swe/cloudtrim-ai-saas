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
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#060a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23060a08'/%3E%3Ccircle cx='16' cy='16' r='11' fill='none' stroke='%233ddc84' stroke-width='1.6'/%3E%3Ccircle cx='16' cy='16' r='6' fill='none' stroke='%233ddc84' stroke-width='1' opacity='.5'/%3E%3Cpath d='M16 16 L27 16' stroke='%23b7ee4f' stroke-width='2'/%3E%3Ccircle cx='21' cy='10' r='2.2' fill='%23ff6b5e'/%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-ink font-display text-mist antialiased">
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
