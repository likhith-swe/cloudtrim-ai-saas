import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/session";
import {
  consumeMagicToken,
  getActiveSubscription,
  upsertProfile,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  const email = token ? await consumeMagicToken(token) : null;
  if (!email) {
    redirect("/login?error=token");
  }

  const sub = await getActiveSubscription(email);
  const vip = sub?.status === "active";
  await upsertProfile(email, { vip, login: true });

  const session = signSession({ email, vip });
  const store = await cookies();
  store.set(COOKIE_NAME, session, sessionCookieOptions(req));

  redirect("/dashboard");
}
