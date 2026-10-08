import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import { upsertProfile, upsertSubscription } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Zero-config QA escape hatch: one click activates a full Club Pro VIP
 * subscription in sandbox mode — no payment rails required.
 */
export async function POST(req: Request) {
  const ip = clientIpFallback(req);
  if (!rateLimit(`sandbox:${ip}`, 20, 60 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* email optional */
  }
  const user = await currentUser();
  const email =
    (typeof body.email === "string" && body.email.trim().toLowerCase()) ||
    user?.email ||
    "qa@cloudtrim.ai";

  const currentPeriodEnd = new Date(
    Date.now() + 90 * 24 * 60 * 60_000,
  ).toISOString();

  await upsertSubscription({
    email,
    provider: "sandbox",
    externalId: null,
    plan: "club-pro",
    status: "active",
    amountMinor: 0,
    currency: "usd",
    currentPeriodEnd,
    createdAt: new Date().toISOString(),
  });
  await upsertProfile(email, { vip: true });

  return NextResponse.json({
    ok: true,
    vip: true,
    email,
    plan: "club-pro",
    provider: "sandbox",
    currentPeriodEnd,
    message: "🎉 Club Pro VIP activated in sandbox mode.",
  });
}
