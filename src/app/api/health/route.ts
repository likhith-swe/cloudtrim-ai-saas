import { NextResponse } from "next/server";
import { dbStatus } from "@/db";
import { CATALOG_VERSION } from "@/lib/fallback-leaks";
import { channelsConfigured } from "@/lib/notify";
import { getStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [stats, db] = await Promise.all([getStats(), dbStatus()]);
    return NextResponse.json({
      ok: true,
      service: "cloudtrim-ai",
      catalogVersion: CATALOG_VERSION,
      db,
      catalogCount: stats.leakCount,
      highImpactCount: stats.highImpactCount,
      totalMonthlyWasteUsdMinor: stats.totalMonthlyWasteMinor,
      avgWasteScore: stats.avgScore,
      lastScanAt: stats.lastScanAt,
      alertChannels: channelsConfigured(),
      uptimeSec: Math.round(process.uptime()),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "health check failed",
      },
      { status: 500 },
    );
  }
}
