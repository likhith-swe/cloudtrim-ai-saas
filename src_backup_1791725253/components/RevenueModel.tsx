import {
  BadgePercent,
  FileCode2,
  Megaphone,
  Plug,
  PiggyBank,
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
    icon: <PiggyBank className="h-5 w-5" />,
    name: "Club Pro subscriptions",
    detail:
      "₹499/mo via Razorpay for India, $9/mo via Stripe everywhere else. The core engine: unlimited tripwires, full catalog, remediation packs.",
    target: "target $2,400/mo @ 300 seats",
    status: "LIVE",
  },
  {
    icon: <BadgePercent className="h-5 w-5" />,
    name: "Affiliate commissions",
    detail:
      "Partner links to the tooling we actually audit with. Every outbound link is disclosed and tagged rel=sponsored.",
    target: "$15–40 per qualified signup",
    status: "LIVE",
  },
  {
    icon: <FileCode2 className="h-5 w-5" />,
    name: "Remediation template marketplace",
    detail:
      "Hardened Terraform modules per leak family: NAT consolidation, snapshot lifecycle policies, right-sizing guardrails.",
    target: "$29 one-time per pack",
    status: "SHIPPING",
  },
  {
    icon: <Plug className="h-5 w-5" />,
    name: "Radar API licensing",
    detail:
      "The leaks + WasteScore API for internal FinOps dashboards. Rate-limited keys, webhook delivery latency SLAs.",
    target: "$199/mo per team",
    status: "WAITLIST",
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    name: "Sponsored radar slots",
    detail:
      "One clearly-labelled sponsor slot per sweep. Never affects leak ranking, scoring or remediation advice.",
    target: "flat $250/mo per slot",
    status: "OPEN",
  },
];

function statusChip(status: Stream["status"]) {
  switch (status) {
    case "LIVE":
      return "border-mint/40 bg-mint/10 text-mint";
    case "SHIPPING":
      return "border-aqua/40 bg-aqua/10 text-aqua";
    case "WAITLIST":
      return "border-gold/40 bg-gold/10 text-gold";
    case "OPEN":
      return "border-skyx/40 bg-skyx/10 text-skyx";
  }
}

/** Transparent 5-stream monetization showcase. */
export default function RevenueModel() {
  return (
    <section id="revenue" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
          open books
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-snow sm:text-4xl">
          How CloudTrim AI pays for itself
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-fog">
          Most FinOps tools hide their revenue model behind &ldquo;enterprise
          sales&rdquo;. We publish ours. Five streams, all disclosed, none of
          them touch the integrity of the radar.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STREAMS.map((s) => (
          <div
            key={s.name}
            className="panel-glow rounded-xl border border-edge bg-panel p-5 transition"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-edge bg-raise text-mint">
                {s.icon}
              </span>
              <span
                className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${statusChip(s.status)}`}
              >
                {s.status}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-snow">
              {s.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fog">{s.detail}</p>
            <p className="mt-4 border-t border-edge pt-3 font-mono text-[10px] uppercase tracking-widest text-mint">
              {s.target}
            </p>
          </div>
        ))}

        <div className="flex flex-col justify-between rounded-xl border border-dashed border-edge2 bg-ink/40 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fog">
            the promise
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Leak ranking, WasteScore and remediation scripts are never
            influenced by revenue. A sponsor can buy a slot — they cannot buy
            a lower score.
          </p>
          <p className="mt-4 font-mono text-[10px] text-fog">
            — the CloudTrim team
          </p>
        </div>
      </div>
    </section>
  );
}
