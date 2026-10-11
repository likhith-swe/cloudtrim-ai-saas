"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import type { CatalogStats } from "@/lib/types";
import { usdRound } from "@/lib/format";
import SavingsCounter from "./SavingsCounter";
import MagnifiedBento from "@/components/ui/magnified-bento";

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
  const [activeTab, setActiveTab] = useState<"bento" | "console">("bento");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Left: pitch + live counter + stats */}
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

          {/* Quick jump to Bento Architecture */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#bento-architecture"
              className="inline-flex items-center gap-2 rounded-lg border border-mint/40 bg-mint/10 px-4 py-2 font-mono text-xs font-semibold text-mint transition hover:bg-mint/20 hover:border-mint/60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Bento Grid ↓</span>
            </a>
            <span className="font-mono text-[10px] text-fog">
              Drag interactive lens on right →
            </span>
          </div>
        </div>

        {/* Right: Interactive Bento Magnifier & Console */}
        <div className="rounded-2xl border border-edge bg-panel/90 p-4 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-edge pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("bento")}
                className={`rounded-lg px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition ${
                  activeTab === "bento"
                    ? "bg-mint/20 text-mint border border-mint/40 shadow-sm shadow-mint/10"
                    : "text-fog hover:text-mist border border-transparent"
                }`}
              >
                🔍 Bento Radar
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={`rounded-lg px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition ${
                  activeTab === "console"
                    ? "bg-mint/20 text-mint border border-mint/40 shadow-sm shadow-mint/10"
                    : "text-fog hover:text-mist border border-transparent"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3 w-3" />
                  Sweep Console
                </span>
              </button>
            </div>
            <span className="font-mono text-[10px] text-fog">
              {matched} in scope
            </span>
          </div>

          {activeTab === "bento" ? (
            <div className="pt-2">
              <MagnifiedBento />

              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
                <input
                  value={filters.q}
                  onChange={(e) => onChange({ q: e.target.value })}
                  placeholder="Quick grep leak: ec2, ebs, nat, rds…"
                  className="w-full rounded-lg border border-edge bg-ink py-2 pl-10 pr-3 font-mono text-xs text-snow placeholder:text-fog/60 focus:border-mint/60 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <div className="relative mt-3">
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
          )}
        </div>
      </div>
    </section>
  );
}
