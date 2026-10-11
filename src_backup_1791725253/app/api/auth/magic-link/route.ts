import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notify";
import { createMagicToken, getActiveSubscription } from "@/lib/queries";
import { clientIpFallback, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIpFallback(req);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!rateLimit(`magic:${email || ip}`, 5, 15 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const token = await createMagicToken(email);
  const origin = new URL(req.url).origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${token}`;

  const sub = await getActiveSubscription(email);
  const emailResult = await sendEmail(
    email,
    "☁️ Your CloudTrim AI sign-in link",
    `<div style="font-family:monospace;background:#060A08;color:#EAF2EC;padding:32px">
      <h2 style="color:#3DDC84">CloudTrim AI — sign in</h2>
      <p>Your waste radar is one click away${sub ? " (Club Pro active)" : ""}.</p>
      <p><a href="${verifyUrl}" style="background:#3DDC84;color:#060A08;padding:12px 24px;text-decoration:none;font-weight:bold">Open the radar →</a></p>
      <p style="color:#7E948A">Link expires in 15 minutes and works once.<br/>${verifyUrl}</p>
    </div>`,
  );

  return NextResponse.json({
    ok: true,
    sent: true,
    emailed: emailResult.ok,
    emailDetail: emailResult.detail,
    // Instant QA preview link — always returned so sandbox testers can
    // complete the passwordless loop without a live mailbox.
    qaLink: verifyUrl,
    expiresIn: 900,
  });
}
