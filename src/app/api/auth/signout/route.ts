import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const store = await cookies();
  const secure =
    process.env.NODE_ENV === "production" &&
    (req.headers.get("x-forwarded-proto") ?? "").includes("https");
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
