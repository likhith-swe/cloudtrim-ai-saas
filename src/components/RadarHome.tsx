"use client";

import { useEffect, useMemo, useState } from "react";
import type { CatalogStats, CloudLeak } from "@/lib/types";
import Hero, { type HeroFilters } from "./Hero";
import LeakGrid from "./LeakGrid";
import RevenueModel from "./RevenueModel";
import WasteTicker from "./WasteTicker";
import { useModals } from "./GlobalModals";
import FluidExpandingGrid from "@/components/ui/fluid-expanding-grid";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

function filterLeaks(leaks: CloudLeak[], f: HeroFilters): CloudLeak[] {
  let out = leaks;
  if (f.provider !== "all") out = out.filter((l) => l.provider === f.provider);
  if (f.service !== "all") out = out.filter((l) => l.service === f.service);
  if (f.category !== "all") out = out.filter((l) => l.category === f.category);
  if (f.minWasteUsd > 0) {
    out = out.filter((l) => l.monthlyWasteUsd >= f.minWasteUsd * 100);
  }
  const q = f.q.trim().toLowerCase();
  if (q) {
    out = out.filter((l) =>
      [l.id, l.resourceName, l.service, l.region, l.detectionReason, l.provider]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  return out;
}

const COMPARISON: { feature: string; free: string; pro: string }[] = [
  { feature: "Leak signatures", free: "Top 10", pro: "All 30+ & custom radars" },
  { feature: "Tripwire alerts", free: "1 · email only", pro: "Unlimited · Slack / Telegram / WhatsApp / Email" },
  { feature: "Remediation", free: "CLI commands", pro: "Terraform + CLI + audit trail" },
  { feature: "Scan freshness", free: "Hourly", pro: "5-minute queue" },
  { feature: "WasteScore history", free: "—", pro: "90-day burn-down" },
  { feature: "Support", free: "Community", pro: "Direct line to the radar team" },
];

export default function RadarHome({
  leaks,
  stats,
  services,
}: {
  leaks: CloudLeak[];
  stats: CatalogStats;
  services: string[];
}) {
  const { open } = useModals();
  const [filters, setFilters] = useState<HeroFilters>({
    provider: "all",
    service: "all",
    category: "all",
    minWasteUsd: 0,
    q: "",
  });

  useEffect(() => {
    try {
      const cat = new URLSearchParams(window.location.search).get("category");
      if (cat) setFilters((f) => ({ ...f, category: cat }));
    } catch {
      /* SSR safety */
    }
  }, []);

  const filtered = useMemo(() => filterLeaks(leaks, filters), [leaks, filters]);

  return (
    <>
      {/* 3D Ethereal Beams Hero (Three.js WebGL procedural GLSL shaders) */}
      <EtherealBeamsHero
        showNavbar={false}
        lightColor="#3ddc84"
        brandName="CloudTrim AI"
        badgeText="FINOPS CLOUD RADAR // 3D LIGHT BEAMS CORE"
        headlinePart1="Detect"
        headlineGradient="25–40% Cloud Waste"
        headlinePart2="feeding zombies."
        subtitle="Idle compute, unattached EBS volumes, NAT gateways routing zero traffic. Scored 0–100, priced per hour, with 1-click Terraform fixes."
        primaryCtaText="Launch FinOps Audit"
        secondaryCtaText="Inspect Bento Radar ↓"
        stats={[
          { value: "$8,778/mo", label: "Fleet Waste Identified" },
          { value: `${stats.leakCount} Signatures`, label: "Verified Leaks" },
          { value: "24/7", label: "Real-time Tripwires" },
        ]}
        onPrimaryCtaClick={() => open("pricing")}
        onSecondaryCtaClick={() => {
          const el = document.getElementById("bento-radar-console");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Bento Radar & Sweep Console (with Magnified Bento) */}
      <div id="bento-radar-console">
        <Hero
          stats={stats}
          filters={filters}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          services={services}
          matched={filtered.length}
        />
      </div>

      <WasteTicker leaks={leaks} />

      {/* Bento Grid Architecture Section (21st.dev) */}
      <section id="bento-architecture" className="border-t border-b border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint font-semibold">
                bento grid architecture // 21st.dev
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                Fluid Expanding Cloud Cluster
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Interactive fluid bento gallery. Click any region card below to expand the active inspection zone with spring physics.
              </p>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              3 active bento zones · spring physics
            </div>
          </div>
          <FluidExpandingGrid />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint font-semibold">
              live leak index
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              Every zombie, scored and priced
            </h2>
          </div>
          <button
            onClick={() => open("watchlist")}
            className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gold transition hover:bg-gold/20 shadow-sm"
          >
            ⚡ Arm a tripwire
          </button>
        </div>
        <LeakGrid leaks={filtered} />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
              Clear &amp; Predictable Pricing
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Cheaper than a single idle NAT gateway
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The reference fleet leaks over $8,700 every month. CloudTrim Club Pro pays for itself in less than 48 hours.
            </p>
          </div>

          {/* Dual-Card Pricing Showcase */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Free Tier */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1017]/80 p-8 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Community Radar
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm font-medium text-zinc-400">/ forever</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Essential visibility into top cloud waste signatures with zero credit card required.
                </p>

                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-xs text-zinc-300">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Top-10 verified cloud leak signatures
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> 1 automated email tripwire
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Copy-paste AWS/GCP/Azure CLI remediations
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Hourly telemetry scan cadence
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="/login"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
                >
                  Start on Free Radar →
                </a>
              </div>
            </div>

            {/* Club Pro Tier */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl shadow-2xl">
              <span className="absolute -top-3 right-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 shadow-sm">
                Recommended
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Autonomous Protection
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">₹499</span>
                  <span className="text-2xl font-bold text-zinc-400">/ $9</span>
                  <span className="text-sm font-medium text-zinc-400">/ month</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Autonomous FinOps detection, real-time Slack/Telegram alerts, and 1-click Terraform fixes.
                </p>

                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-xs text-zinc-200">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> All 30+ verified leak signatures &amp; custom radars
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Unlimited tripwires (Slack, Telegram, WhatsApp, Email)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> 1-click Terraform &amp; OpenTofu remediation modules
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> 5-minute telemetry scan freshness
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> 90-day WasteScore burn-down &amp; audit trail
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => open("pricing")}
                  className="flex w-full items-center justify-center rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 shadow-lg shadow-white/5"
                >
                  Upgrade to Club Pro →
                </button>
              </div>
            </div>
          </div>

          {/* Capability Matrix */}
          <div className="mt-14 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0d1017]/80 backdrop-blur-xl">
            <div className="grid grid-cols-[1.2fr_1fr_1.2fr] border-b border-white/10 bg-white/[0.03] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <div>Capability</div>
              <div>Free Community</div>
              <div className="text-white">Club Pro</div>
            </div>
            {COMPARISON.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.2fr_1fr_1.2fr] border-b border-white/10 px-6 py-3.5 text-xs last:border-b-0"
              >
                <div className="font-medium text-white">{row.feature}</div>
                <div className="text-zinc-400">{row.free}</div>
                <div className="text-zinc-200 font-medium">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RevenueModel />

      <section className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Get the Monday waste letter
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              New signatures, one Terraform fix, zero spam.
            </p>
          </div>
          <button
            onClick={() => open("newsletter")}
            className="rounded-xl border border-mint/50 bg-mint/10 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20"
          >
            ✉ Subscribe free
          </button>
        </div>
      </section>
    </>
  );
}
