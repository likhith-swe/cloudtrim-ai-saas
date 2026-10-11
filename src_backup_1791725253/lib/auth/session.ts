/** Stateless HMAC-SHA256 signed session tokens (cookie: ct_session). */

import { createHmac, timingSafeEqual } from "node:crypto";
import { ENV } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

export const COOKIE_NAME = "ct_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

export function signSession(user: { email: string; vip: boolean }): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({
      email: user.email,
      vip: user.vip,
      iat,
      exp: iat + SESSION_TTL_SECONDS,
    }),
  );
  const sig = createHmac("sha256", ENV.sessionSecret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  if (typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = createHmac("sha256", ENV.sessionSecret)
    .update(payload)
    .digest();
  let got: Buffer;
  try {
    got = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (got.length !== expected.length || !timingSafeEqual(expected, got)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SessionUser>;
    if (!data.email || typeof data.exp !== "number") return null;
    if (data.exp * 1000 < Date.now()) return null;
    return {
      email: data.email,
      vip: Boolean(data.vip),
      iat: typeof data.iat === "number" ? data.iat : 0,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Cookie options that stay Secure behind an https proxy but degrade to
 * plain cookies on local http origins (dev servers, sandbox smoke tests).
 */
export function sessionCookieOptions(req?: Request) {
  let secure = false;
  if (process.env.NODE_ENV === "production") {
    const fwd = req?.headers.get("x-forwarded-proto") ?? "";
    secure = fwd.includes("https");
  }
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
