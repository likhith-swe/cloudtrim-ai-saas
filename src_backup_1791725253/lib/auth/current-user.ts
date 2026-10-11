/** Server-side helper: read + verify the current user from ct_session. */

import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";
import { COOKIE_NAME, verifySessionToken } from "./session";

export async function currentUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    return verifySessionToken(raw);
  } catch {
    return null;
  }
}
