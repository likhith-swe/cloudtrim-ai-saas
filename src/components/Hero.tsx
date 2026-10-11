"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import type { CatalogStats } from "@/lib/types";
import { usdRound } from "@/lib/format";
import SavingsCounter from "./SavingsCounter";
import MagnifiedBento from "@/components/ui/magnified-bento";
import BeamCard from "@/components/ui/beam-card";

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
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Find the{" "}
            <span className="text-ember glow-ember">25–40%</span> of your
            cloud budget feeding{" "}
            <span className="text-mint glow-mint">zombies</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300">
            Idle compute, unattached EBS volumes, NAT gateways routing nothing,
            RDS replicas with zero connections. CloudTrim scores every leak
            0–100, prices it per hour, and hands you the copy-paste Terraform
            fix before the invoice does.
          </p>

          <div className="mt-8">
            <SavingsCounter initialMinor={stats.totalMonthlyWasteMinor} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
            <span>
              <span className="font-bold text-white">{stats.leakCount}</span> verified
              signatures
            </span>
            <span>
              <span className="font-bold text-ember">{stats.highImpactCount}</span>{" "}
              high-impact
            </span>
            <span>
              avg score <span className="font-bold text-gold">{stats.avgScore}</span>
            </span>
          </div>

          {/* Quick jump to Bento Architecture */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#bento-architecture"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
            >
              <Sparkles className="h-3.5 w-3.5 text-mint" />
              <span>Explore Bento Grid ↓</span>
            </a>
            <span className="font-mono text-[10px] text-zinc-400">
              Drag interactive lens on right →
            </span>
          </div>
        </div>

        {/* Right: Traveling Beam 3D Interactive Console (BeamCard) */}
        <BeamCard enableTilt={true} beamColor="white" innerClassName="p-5 sm:p-7">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("bento")}
                className={`rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "bento"
                    ? "bg-white/15 text-white border border-white/30 shadow-md shadow-white/5"
                    : "text-zinc-400 hover:text-white border border-transparent"
                }`}
              >
                🔍 Bento Radar
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={`rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "console"
                    ? "bg-white/15 text-white border border-white/30 shadow-md shadow-white/5"
                    : "text-zinc-400 hover:text-white border border-transparent"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-mint" />
                  Sweep Console
                </span>
              </button>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-300">
              {matched} in scope
            </span>
          </div>

          {activeTab === "bento" ? (
            <div className="pt-3">
              <MagnifiedBento />

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={filters.q}
                  onChange={(e) => onChange({ q: e.target.value })}
                  placeholder="Quick grep leak: ec2, ebs, nat, rds…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="pt-3">
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={filters.q}
                  onChange={(e) => onChange({ q: e.target.value })}
                  placeholder="grep: resource id, service, region…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
                  cloud provider
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => onChange({ provider: p.key })}
                      className={`rounded-lg py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition ${
                        filters.provider === p.key
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
                  service
                </p>
                <select
                  value={filters.service}
                  onChange={(e) => onChange({ service: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0c111c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
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
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-semibold">
                    minimum monthly savings
                  </p>
                  <p className="font-mono text-sm font-bold text-mint">
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
                  className="mt-3 w-full accent-white cursor-pointer"
                />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-400">
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

              <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[10px] leading-relaxed text-zinc-400">
                <span className="text-mint font-semibold">TIP</span> — arm a{" "}
                <span className="text-white font-medium">tripwire</span> on any leak to get
                pinged on Slack / Telegram / WhatsApp before billing closes.
              </p>
            </div>
          )}
        </BeamCard>
      </div>
    </section>
  );
}
