import { NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIpFallback(req);
  if (!rateLimit(`newsletter:${ip}`, 10, 60 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const source = String(body.source ?? "modal").slice(0, 48);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const result = await subscribeNewsletter(email, source);
  if (!result.ok) {
    return NextResponse.json({ error: "subscribe_failed" }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    already: result.already,
    message: result.already
      ? "You're already on the waste digest list."
      : "Subscribed. First weekly waste digest lands Monday 07:00 UTC.",
  });
}
