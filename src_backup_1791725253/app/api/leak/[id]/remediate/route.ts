import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/current-user";
import { getLeak, recordRemediation } from "@/lib/queries";
import { rateLimit, clientIpFallback } from "@/lib/ratelimit";
import { usdRound } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const ip = clientIpFallback(req);
  if (!rateLimit(`remediate:${ip}`, 60, 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const leak = await getLeak(id);
  if (!leak) {
    return NextResponse.json({ error: "leak_not_found" }, { status: 404 });
  }

  const user = await currentUser();
  const stamp = new Date().toISOString();
  const banner = [
    `# ── CloudTrim AI remediation script`,
    `# leak        : ${leak.id}`,
    `# resource    : ${leak.resourceName}`,
    `# waste       : ${usdRound(leak.monthlyWasteUsd)}/mo (WasteScore ${leak.wasteScore}/100)`,
    `# risk        : ${leak.riskLevel}`,
    `# generated   : ${stamp}`,
    `# review before applying in production.`,
    ``,
  ].join("\n");

  const terraform = `${banner}${leak.remediationScriptTerraform}\n`;
  const cli = `${banner
    .split("\n")
    .filter((l) => l.startsWith("#"))
    .join("\n")}\n${leak.remediationScriptCli}\n`;

  await recordRemediation(leak.id, user?.email ?? null, "terraform");

  return NextResponse.json({
    leakId: leak.id,
    generatedAt: stamp,
    requestedBy: user?.email ?? "anonymous",
    terraform,
    cli,
  });
}

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  return POST(req, ctx);
}
