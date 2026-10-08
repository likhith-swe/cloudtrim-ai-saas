import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import {
  createStripeCheckoutSession,
  razorpayCheckoutUrl,
} from "@/lib/billing";
import { upsertSubscription } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIpFallback(req);
  if (!rateLimit(`checkout:${ip}`, 20, 60 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* provider defaults to razorpay */
  }
  const provider = String(body.provider ?? "razorpay");
  const origin = new URL(req.url).origin;
  const user = await currentUser();
  const email =
    (typeof body.email === "string" && body.email.trim()) ||
    user?.email ||
    "qa@cloudtrim.ai";

  if (provider === "stripe") {
    const url = await createStripeCheckoutSession({
      email,
      successUrl: `${origin}/dashboard?vip=stripe`,
      cancelUrl: `${origin}/#pricing`,
    });
    if (url) {
      return NextResponse.json({ provider: "stripe", url, simulated: false });
    }
    // Zero-config sandbox: no Stripe keys → instant simulated activation.
    const periodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60_000,
    ).toISOString();
    await upsertSubscription({
      email,
      provider: "sandbox",
      externalId: null,
      plan: "club-pro",
      status: "active",
      amountMinor: 900,
      currency: "usd",
      currentPeriodEnd: periodEnd,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      provider: "stripe",
      simulated: true,
      url: `${origin}/dashboard?vip=sandbox`,
      email,
    });
  }

  // Default: Razorpay hosted payment link (India, ₹499/mo).
  return NextResponse.json({
    provider: "razorpay",
    url: razorpayCheckoutUrl(),
    simulated: false,
  });
}
