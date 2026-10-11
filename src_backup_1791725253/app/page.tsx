import type { Metadata } from "next";
import RadarHome from "@/components/RadarHome";
import { allServices } from "@/lib/fallback-leaks";
import { getStats, listLeaks } from "@/lib/queries";

export const metadata: Metadata = {
  title: "FinOps Cloud Waste Radar — Detect, Score, Fix",
  description:
    "30 verified cloud waste signatures scored 0-100 with exact $/mo burn and 1-click Terraform + CLI remediation. AWS, GCP and Azure zombies welcome.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [leaks, stats] = await Promise.all([listLeaks(), getStats()]);
  return <RadarHome leaks={leaks} stats={stats} services={allServices()} />;
}
