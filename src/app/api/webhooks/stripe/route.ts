import { NextResponse } from "next/server";
import { verifyStripeWebhook } from "@/lib/billing";
import { upsertProfile, upsertSubscription } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver with manual Stripe-Signature verification
 * (t=<ts>,v1=<hmac>). Without STRIPE_WEBHOOK_SECRET the event is accepted
 * but flagged unverified so sandbox flows keep working.
 */
export async function POST(req: Request) {
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const verified = verifyStripeWebhook(
    raw,
    req.headers.get("stripe-signature"),
  );
  if (verified === false) {
    return NextResponse.json(
      { received: false, error: "invalid_signature" },
      { status: 400 },
    );
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: false, verified }, { status: 400 });
  }

  const type = String(event.type ?? "");
  const data = event.data as { object?: Record<string, unknown> } | undefined;
  const obj = data?.object ?? {};

  const email =
    typeof obj.customer_email === "string"
      ? obj.customer_email
      : typeof obj.customer === "string"
        ? obj.customer
        : "";
  const externalId =
    typeof obj.subscription === "string"
      ? obj.subscription
      : typeof obj.id === "string"
        ? obj.id
        : null;

  if (email && email.includes("@")) {
    if (type === "checkout.session.completed") {
      await upsertSubscription({
        email: email.toLowerCase(),
        provider: "stripe",
        externalId,
        plan: "club-pro",
        status: "active",
        amountMinor: 900,
        currency: "usd",
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60_000,
        ).toISOString(),
        createdAt: new Date().toISOString(),
      });
      await upsertProfile(email.toLowerCase(), { vip: true });
    } else if (type === "customer.subscription.deleted") {
      await upsertSubscription({
        email: email.toLowerCase(),
        provider: "stripe",
        externalId,
        plan: "club-pro",
        status: "canceled",
        amountMinor: 900,
        currency: "usd",
        currentPeriodEnd: null,
        createdAt: new Date().toISOString(),
      });
      await upsertProfile(email.toLowerCase(), { vip: false });
    } else if (type === "invoice.payment_failed") {
      await upsertSubscription({
        email: email.toLowerCase(),
        provider: "stripe",
        externalId,
        plan: "club-pro",
        status: "past_due",
        amountMinor: 900,
        currency: "usd",
        currentPeriodEnd: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true, verified, type: type || "unknown" });
}
