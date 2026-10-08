import { NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/billing";
import { upsertProfile, upsertSubscription } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook receiver.
 * Signature: HMAC_SHA256(raw body, RAZORPAY_WEBHOOK_SECRET) in
 * `x-razorpay-signature`. Without a configured secret the event is accepted
 * but marked unverified so sandbox flows keep working.
 */
export async function POST(req: Request) {
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  const verified = verifyRazorpayWebhook(raw, signature);
  if (verified === false) {
    return NextResponse.json(
      { received: false, error: "invalid_signature" },
      { status: 400 },
    );
  }

  let event: Record<string, unknown> = {};
  try {
    event = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: false, verified }, { status: 400 });
  }

  const eventName = String(event.event ?? "");
  const payload = (event.payload ?? {}) as Record<
    string,
    { entity?: Record<string, unknown> } | undefined
  >;
  const payment = payload.payment?.entity ?? {};
  const link = payload.payment_link?.entity ?? {};

  const email =
    (typeof payment.email_address === "string" && payment.email_address) ||
    (typeof link.notes === "object" &&
      link.notes !== null &&
      typeof (link.notes as Record<string, unknown>).email === "string" &&
      ((link.notes as Record<string, unknown>).email as string)) ||
    (typeof event.account_id === "string" && event.account_id) ||
    "";

  if (email && /paid|captured|processed/i.test(eventName)) {
    const amount =
      typeof payment.amount === "number" ? payment.amount : 49_900;
    await upsertSubscription({
      email: String(email).toLowerCase(),
      provider: "razorpay",
      externalId:
        typeof payment.id === "string" ? payment.id : null,
      plan: "club-pro",
      status: "active",
      amountMinor: amount,
      currency: "inr",
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60_000,
      ).toISOString(),
      createdAt: new Date().toISOString(),
    });
    await upsertProfile(String(email).toLowerCase(), { vip: true });
  }

  if (email && /failed/i.test(eventName)) {
    await upsertSubscription({
      email: String(email).toLowerCase(),
      provider: "razorpay",
      externalId: typeof payment.id === "string" ? payment.id : null,
      plan: "club-pro",
      status: "past_due",
      amountMinor: typeof payment.amount === "number" ? payment.amount : 49_900,
      currency: "inr",
      currentPeriodEnd: null,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    received: true,
    verified,
    event: eventName || "unknown",
  });
}
