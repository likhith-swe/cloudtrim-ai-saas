import type { MetadataRoute } from "next";
import {
  FALLBACK_LEAKS,
  providerServicePairs,
  serviceSlug,
} from "@/lib/fallback-leaks";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const hubs: MetadataRoute.Sitemap = providerServicePairs().map((p) => ({
    url: `${base}/leaks/${p.provider}/${serviceSlug(p.service)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const leakPages: MetadataRoute.Sitemap = FALLBACK_LEAKS.map((l) => ({
    url: `${base}/leak/${l.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...core, ...hubs, ...leakPages];
}
