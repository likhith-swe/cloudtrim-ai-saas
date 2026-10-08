/**
 * Dual-currency billing helpers.
 *  - India: Razorpay hosted payment link (fallback https://razorpay.me/@NEXVRA)
 *  - Global: Stripe Checkout Sessions via raw REST (no SDK dependency)
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { ENV } from "./env";

export const PLANS = {
  inr: { amountMinor: 49_900, currency: "inr" as const, label: "Club Pro India" },
  usd: { amountMinor: 900, currency: "usd" as const, label: "Club Pro Global" },
};

export function razorpayCheckoutUrl(): string {
  return ENV.razorpayLink;
}

function safeEqualHex(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Razorpay webhook verification: HMAC_SHA256(raw body, webhook secret).
 * Returns `null` when no secret is configured (sandbox passthrough).
 */
export function verifyRazorpayWebhook(
  rawBody: string,
  signatureHeader: string | null,
): boolean | null {
  const secret = ENV.razorpayWebhookSecret;
  if (!secret) return null;
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signatureHeader);
}

/**
 * Stripe webhook verification: `Stripe-Signature: t=<ts>,v1=<hex>` where
 * v1 = HMAC_SHA256("<ts>.<raw body>", webhook secret).
 * Returns `null` when no secret is configured (sandbox passthrough).
 */
export function verifyStripeWebhook(
  rawBody: string,
  header: string | null,
  toleranceMs = 5 * 60_000,
): boolean | null {
  const secret = ENV.stripeWebhookSecret;
  if (!secret) return null;
  if (!header) return false;

  const parts = new Map<string, string>();
  for (const seg of header.split(",")) {
    const [k, v] = seg.split("=", 2);
    if (k && v) parts.set(k.trim(), v.trim());
  }
  const t = parts.get("t");
  const v1 = parts.get("v1");
  if (!t || !v1) return false;

  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts * 1000) > toleranceMs) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  return safeEqualHex(expected, v1);
}

/**
 * Create a Stripe Checkout Session via the REST API (no SDK).
 * Returns the hosted checkout URL, or null when not configured / on error.
 */
export async function createStripeCheckoutSession(opts: {
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  if (!ENV.stripeSecretKey || !ENV.stripePriceId) return null;
  try {
    const body = new URLSearchParams({
      mode: "subscription",
      customer_email: opts.email,
      "line_items[0][price]": ENV.stripePriceId,
      "line_items[0][quantity]": "1",
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      "metadata[source]": "cloudtrim-pricing-modal",
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string; id?: string };
    return json.url ?? null;
  } catch {
    return null;
  }
}
