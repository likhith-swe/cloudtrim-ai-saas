import {
  BadgePercent,
  FileCode2,
  Megaphone,
  Plug,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

interface Stream {
  icon: ReactNode;
  name: string;
  detail: string;
  target: string;
  status: "LIVE" | "SHIPPING" | "WAITLIST" | "OPEN";
}

const STREAMS: Stream[] = [
  {
    icon: <PiggyBank className="h-5 w-5 text-emerald-400" />,
    name: "Club Pro Subscriptions",
    detail:
      "₹499/mo via Razorpay for India, $9/mo via Stripe globally. Unlimited real-time tripwires, full 30+ signature catalog, and 1-click Terraform remediations.",
    target: "Target: $2,400/mo @ 300 seats",
    status: "LIVE",
  },
  {
    icon: <BadgePercent className="h-5 w-5 text-sky-400" />,
    name: "Affiliate Tooling Commissions",
    detail:
      "Direct partnerships with audited FinOps tooling providers. Every outbound reference is strictly disclosed, verified, and tagged rel=sponsored.",
    target: "$15–40 per qualified signup",
    status: "LIVE",
  },
  {
    icon: <FileCode2 className="h-5 w-5 text-indigo-400" />,
    name: "Remediation Marketplace",
    detail:
      "Hardened Terraform & OpenTofu infrastructure modules per leak family: NAT consolidation, EBS snapshot lifecycles, and auto-scaling guardrails.",
    target: "$29 one-time per module pack",
    status: "SHIPPING",
  },
  {
    icon: <Plug className="h-5 w-5 text-amber-400" />,
    name: "FinOps Radar API Licensing",
    detail:
      "High-throughput WasteScore REST & GraphQL API for enterprise dashboards, CI/CD PR blocking, and real-time webhook delivery SLAs.",
    target: "$199/mo per engineering team",
    status: "WAITLIST",
  },
  {
    icon: <Megaphone className="h-5 w-5 text-purple-400" />,
    name: "Sponsored Radar Slots",
    detail:
      "One clearly labeled sponsor spot per telemetry sweep. Never influences leak ranking, WasteScore calculations, or remediation advice.",
    target: "Flat $250/mo per telemetry slot",
    status: "OPEN",
  },
];

function statusBadge(status: Stream["status"]) {
  switch (status) {
    case "LIVE":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    case "SHIPPING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-sky-400">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          Shipping
        </span>
      );
    case "WAITLIST":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
          Waitlist
        </span>
      );
    case "OPEN":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
          Available
        </span>
      );
  }
}

/** Transparent 5-stream monetization showcase. */
export default function RevenueModel() {
  return (
    <section id="revenue" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
          Public Ledger &amp; Integrity
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          How CloudTrim AI pays for itself
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Most FinOps tools hide their revenue model behind opaque enterprise sales.
          We disclose ours openly across five distinct revenue streams—none of which compromise the neutral scoring of the radar.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {STREAMS.map((s) => (
          <div
            key={s.name}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1017]/85 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-[#111622]/90 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] group-hover:scale-105 transition-transform">
                  {s.icon}
                </span>
                {statusBadge(s.status)}
              </div>
              <h3 className="mt-5 text-base font-bold text-white tracking-tight">
                {s.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {s.detail}
              </p>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <span className="font-mono text-[11px] font-medium text-zinc-300">
                {s.target}
              </span>
            </div>
          </div>
        ))}

        {/* The Integrity Guarantee Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-6 backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                The Neutrality Guarantee
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              Zero Sponsored Scoring Bias
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-300">
              Leak ranking, WasteScores, and remediation scripts are computed 100% deterministically from public cloud telemetry.
              A sponsor or partner cannot purchase a favorable score or suppress a leak signature.
            </p>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] text-zinc-400">
            Verified by the CloudTrim Engineering Team
          </div>
        </div>
      </div>
    </section>
  );
}
