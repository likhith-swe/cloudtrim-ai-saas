import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import { getActiveSubscription } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ user: null, vip: false });
  }
  const sub = await getActiveSubscription(user.email);
  const vip = sub?.status === "active" || user.vip;
  return NextResponse.json({
    user: { email: user.email, vip },
    vip,
    plan: sub?.plan ?? "free",
    provider: sub?.provider ?? null,
  });
}
