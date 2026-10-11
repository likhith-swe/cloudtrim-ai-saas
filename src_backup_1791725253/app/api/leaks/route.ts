import { NextResponse } from "next/server";
import { isHighImpactLeak } from "@/lib/waste-score";
import { listLeaks } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";
import type { LeakFilters, RiskLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

const RISK_VALUES: RiskLevel[] = [
  "safe_to_terminate",
  "needs_snapshot",
  "production_review",
];

export async function GET(req: Request) {
  const ip = clientIpFallback(req);
  if (!rateLimit(`leaks:${ip}`, 240, 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const filters: LeakFilters = {};
  const provider = searchParams.get("provider");
  if (provider) filters.provider = provider;
  const service = searchParams.get("service");
  if (service) filters.service = service;
  const category = searchParams.get("category");
  if (category) filters.category = category;
  const minScore = Number(searchParams.get("minScore"));
  if (Number.isFinite(minScore) && minScore > 0) {
    filters.minScore = Math.min(100, minScore);
  }
  const minWaste = Number(searchParams.get("minWasteUsd"));
  if (Number.isFinite(minWaste) && minWaste > 0) {
    filters.minWasteMinor = Math.round(minWaste * 100);
  }
  const maxRisk = searchParams.get("maxRisk") as RiskLevel | null;
  if (maxRisk && RISK_VALUES.includes(maxRisk)) filters.maxRisk = maxRisk;
  const q = searchParams.get("q");
  if (q) filters.q = q;
  const sort = searchParams.get("sort");
  if (sort === "waste" || sort === "score" || sort === "recent") {
    filters.sort = sort;
  }

  try {
    const leaks = await listLeaks(filters);
    const total = leaks.reduce((acc, l) => acc + l.monthlyWasteUsd, 0);
    const highImpact = leaks.filter((l) =>
      isHighImpactLeak(l.wasteScore, l.monthlyWasteUsd),
    ).length;
    return NextResponse.json({
      count: leaks.length,
      totalMonthlyWasteUsdMinor: total,
      highImpactCount: highImpact,
      leaks,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "leak query failed" },
      { status: 500 },
    );
  }
}
