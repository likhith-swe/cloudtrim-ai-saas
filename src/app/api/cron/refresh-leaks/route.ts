import { NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { runScanCycle } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Cron entry point: simulates a fresh infrastructure scan, re-jitters waste
 * telemetry, evaluates every armed tripwire and dispatches multi-channel
 * alerts. Protect with CRON_SECRET when running against a scheduler.
 */
async function scan(req: Request) {
  if (ENV.cronSecret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${ENV.cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  try {
    const summary = await runScanCycle();
    return NextResponse.json({
      ok: true,
      scanned: summary.scanned,
      tripwiresTriggered: summary.triggered,
      alertsDelivered: summary.delivered,
      channels: summary.results.map((r) => ({
        channel: r.channel,
        ok: r.ok,
        skipped: r.skipped,
        latencyMs: r.latencyMs,
      })),
      finishedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "scan failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  return scan(req);
}

export async function POST(req: Request) {
  return scan(req);
}
