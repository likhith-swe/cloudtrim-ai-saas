import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import {
  deleteWatchlist,
  listWatchlists,
  setWatchlistEnabled,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let action = "toggle";
  try {
    const body = (await req.json()) as { action?: string };
    if (body.action === "enable" || body.action === "disable") {
      action = body.action;
    }
  } catch {
    /* default to toggle */
  }

  const mine = await listWatchlists(user.email);
  const target = mine.find((w) => w.id === id);
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const enabled =
    action === "toggle" ? !target.enabled : action === "enable";
  await setWatchlistEnabled(id, user.email, enabled);
  return NextResponse.json({ id, enabled });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<Params> },
) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deleted = await deleteWatchlist(id, user.email);
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id });
}
