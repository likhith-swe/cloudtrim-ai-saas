import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import { channelsConfigured } from "@/lib/notify";
import { createWatchlist, listWatchlists } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";
import type { AlertChannel } from "@/lib/types";

export const dynamic = "force-dynamic";

const CHANNELS: AlertChannel[] = ["telegram", "whatsapp", "slack", "email"];

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const watchlists = await listWatchlists(user.email);
  return NextResponse.json({
    watchlists,
    channelsConfigured: channelsConfigured(),
  });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ip = clientIpFallback(req);
  if (!rateLimit(`watchlist:create:${ip}`, 10, 60 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const label = String(body.label ?? "").trim().slice(0, 60);
  const providerRaw = String(body.provider ?? "any");
  const provider = ["aws", "gcp", "azure", "any"].includes(providerRaw)
    ? providerRaw
    : "any";
  const service = String(body.service ?? "any").trim().slice(0, 48) || "any";
  const channelRaw = String(body.channel ?? "email");
  const channel = (CHANNELS as string[]).includes(channelRaw)
    ? (channelRaw as AlertChannel)
    : "email";
  const minUsd = Number(body.minMonthlyWasteUsd ?? 100);
  if (!label) {
    return NextResponse.json({ error: "label_required" }, { status: 400 });
  }
  if (!Number.isFinite(minUsd) || minUsd < 1 || minUsd > 100_000) {
    return NextResponse.json(
      { error: "invalid_threshold" },
      { status: 400 },
    );
  }

  const watchlist = await createWatchlist({
    email: user.email,
    label,
    provider: provider as "aws" | "gcp" | "azure" | "any",
    service,
    minMonthlyWasteUsd: Math.round(minUsd * 100),
    channel,
  });

  return NextResponse.json({ watchlist }, { status: 201 });
}
