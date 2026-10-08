"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { CatalogStats } from "@/lib/types";
import { usdRound } from "@/lib/format";
import SavingsCounter from "./SavingsCounter";

export interface HeroFilters {
  provider: string;
  service: string;
  category: string;
  minWasteUsd: number;
  q: string;
}

const PROVIDERS = [
  { key: "all", label: "ALL" },
  { key: "aws", label: "AWS" },
  { key: "gcp", label: "GCP" },
  { key: "azure", label: "AZURE" },
];

export default function Hero({
  stats,
  filters,
  onChange,
  services,
  matched,
}: {
  stats: CatalogStats;
  filters: HeroFilters;
  onChange: (patch: Partial<HeroFilters>) => void;
  services: string[];
  matched: number;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        {/* Left: pitch + live counter + radar visual */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
            finops waste radar // live sweep
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-snow sm:text-6xl">
            Find the{" "}
            <span className="text-ember glow-ember">25–40%</span> of your
            cloud budget feeding{" "}
            <span className="text-mint glow-mint">zombies</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-fog">
            Idle compute, unattached EBS volumes, NAT gateways routing nothing,
            RDS replicas with zero connections. CloudTrim scores every leak
            0–100, prices it per hour, and hands you the copy-paste Terraform
            fix before the invoice does.
          </p>

          <div className="mt-8">
            <SavingsCounter initialMinor={stats.totalMonthlyWasteMinor} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
            <span>
              <span className="text-snow">{stats.leakCount}</span> verified
              signatures
            </span>
            <span>
              <span className="text-ember">{stats.highImpactCount}</span>{" "}
              high-impact
            </span>
            <span>
              avg score <span className="text-gold">{stats.avgScore}</span>
            </span>
          </div>

          {/* radar dish */}
          <div className="relative mt-10 hidden h-44 w-44 lg:block">
            <div className="absolute inset-0 rounded-full border border-edge2/80" />
            <div className="absolute inset-5 rounded-full border border-edge2/60" />
            <div className="absolute inset-10 rounded-full border border-edge2/40" />
            <div className="absolute inset-[68px] rounded-full border border-edge2/30" />
            <div className="radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(61,220,132,0.32),transparent_75deg)]" />
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint pulse-dot" />
            <span className="blip absolute left-[70%] top-[22%] h-2 w-2 rounded-full bg-ember" />
            <span
              className="blip absolute left-[24%] top-[58%] h-1.5 w-1.5 rounded-full bg-gold"
              style={{ animationDelay: "0.8s" }}
            />
            <span
              className="blip absolute left-[55%] top-[70%] h-1.5 w-1.5 rounded-full bg-ember"
              style={{ animationDelay: "1.4s" }}
            />
          </div>
        </div>

        {/* Right: search console */}
        <div className="rounded-2xl border border-edge bg-panel/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              sweep console
            </p>
            <span className="font-mono text-[10px] text-fog">
              {matched} in scope
            </span>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
            <input
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="grep: resource id, service, region…"
              className="w-full rounded-lg border border-edge bg-ink py-2.5 pl-10 pr-3 font-mono text-sm text-snow placeholder:text-fog/60 focus:border-mint/60 focus:outline-none"
            />
          </div>

          <div className="mt-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
              cloud provider
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1 rounded-lg border border-edge bg-ink p-1">
              {PROVIDERS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => onChange({ provider: p.key })}
                  className={`rounded-md py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition ${
                    filters.provider === p.key
                      ? "bg-mint/15 text-mint"
                      : "text-fog hover:text-mist"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
              service
            </p>
            <select
              value={filters.service}
              onChange={(e) => onChange({ service: e.target.value })}
              className="mt-2 w-full rounded-lg border border-edge bg-ink px-3 py-2.5 font-mono text-sm text-snow focus:border-mint/60 focus:outline-none"
            >
              <option value="all">all services</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
                minimum monthly savings
              </p>
              <p className="font-mono text-xs font-bold text-mint">
                ≥ {filters.minWasteUsd > 0 ? usdRound(filters.minWasteUsd * 100) : "$0"}
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={900}
              step={25}
              value={filters.minWasteUsd}
              onChange={(e) =>
                onChange({ minWasteUsd: Number(e.target.value) })
              }
              className="mt-3 w-full"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-fog">
              <span>$0</span>
              <span>$450</span>
              <span>$900+</span>
            </div>
          </div>

          {filters.category !== "all" ? (
            <button
              onClick={() => onChange({ category: "all" })}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold"
            >
              category: {filters.category} ✕
            </button>
          ) : null}

          <p className="mt-6 border-t border-edge pt-4 font-mono text-[10px] leading-relaxed text-fog">
            <span className="text-mint">TIP</span> — arm a{" "}
            <span className="text-snow">tripwire</span> on any leak to get
            pinged on Slack / Telegram / WhatsApp before billing closes.
          </p>
        </div>
      </div>
    </section>
  );
}
