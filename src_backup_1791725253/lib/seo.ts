/** Structured JSON-LD builders (Product, Offer, BreadcrumbList). */

import { ENV } from "./env";
import { usdRound } from "./format";
import type { CloudLeak } from "./types";

export function siteUrl(): string {
  return ENV.siteUrl.replace(/\/$/, "");
}

export function jsonLdProduct() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CloudTrim AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Institutional-grade FinOps cloud waste, zombie resource and cost-leak radar with 1-click Terraform remediation.",
    url: siteUrl(),
    offers: [
      {
        "@type": "Offer",
        name: "Club Pro (India)",
        price: "499",
        priceCurrency: "INR",
        url: ENV.razorpayLink,
      },
      {
        "@type": "Offer",
        name: "Club Pro (Global)",
        price: "9",
        priceCurrency: "USD",
        url: siteUrl(),
      },
    ],
  };
}

export function jsonLdLeak(leak: CloudLeak) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${leak.service} waste audit: ${leak.resourceName} burns ${usdRound(leak.monthlyWasteUsd)}/mo`,
    description: leak.detectionReason,
    url: `${siteUrl()}/leak/${leak.id}`,
    about: {
      "@type": "Thing",
      name: `${leak.provider.toUpperCase()} ${leak.service} cost optimization`,
    },
    keywords: [
      "FinOps",
      "cloud waste",
      leak.service,
      leak.provider,
      "Terraform remediation",
    ],
  };
}

export function jsonLdBreadcrumbs(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl()}${it.path}`,
    })),
  };
}

export function jsonLdHub(provider: string, service: string, count: number) {
  const slug = service
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${provider.toUpperCase()} ${service} waste signatures`,
    description: `${count} verified ${service} cost-leak signatures on ${provider.toUpperCase()} with Terraform + CLI remediation.`,
    url: `${siteUrl()}/leaks/${provider}/${slug}`,
  };
}
