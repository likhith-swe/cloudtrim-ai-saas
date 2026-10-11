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
      <section id="bento-architecture" className="border-t border-b border-edge/60 bg-panel/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
                bento grid architecture // 21st.dev
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-snow">
                Fluid Expanding Cloud Cluster
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">
                Interactive fluid bento gallery. Click any region card below to expand the active inspection zone with spring physics.
              </p>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-fog">
              3 active bento zones · spring physics
            </div>
          </div>
          <FluidExpandingGrid />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
              live leak index
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-snow">
              Every zombie, scored and priced
            </h2>
          </div>
          <button
            onClick={() => open("watchlist")}
            className="rounded-lg border border-gold/50 bg-gold/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gold transition hover:bg-gold/20"
          >
            ⚡ Arm a tripwire
          </button>
        </div>
        <LeakGrid leaks={filtered} />
      </section>

      {/* Pricing comparison */}
      <section id="pricing" className="border-t border-edge bg-panel/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
              pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-snow sm:text-4xl">
              Cheaper than one idle NAT gateway
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              The reference fleet above leaks nearly $9k every month. Club Pro
              costs less than 0.1% of that. India pays in rupees over Razorpay;
              everyone else in dollars over Stripe.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-edge">
            <div className="grid grid-cols-[1.2fr_1fr_1.4fr] border-b border-edge bg-ink/60 font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
              <div className="px-4 py-3">capability</div>
              <div className="px-4 py-3">free radar</div>
              <div className="px-4 py-3 text-mint">club pro</div>
            </div>
            {COMPARISON.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.2fr_1fr_1.4fr] border-b border-edge text-sm last:border-b-0"
              >
                <div className="px-4 py-3 font-medium text-snow">
                  {row.feature}
                </div>
                <div className="px-4 py-3 text-fog">{row.free}</div>
                <div className="px-4 py-3 text-mist">{row.pro}</div>
              </div>
            ))}
            <div className="grid grid-cols-[1.2fr_1fr_1.4fr] bg-ink/60">
              <div className="px-4 py-4 font-mono text-[10px] uppercase tracking-widest text-fog">
                price
              </div>
              <div className="px-4 py-4">
                <span className="font-mono text-lg font-bold text-snow">$0</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-4">
                <span className="font-mono text-lg font-bold text-snow">₹499</span>
                <span className="font-mono text-sm text-fog">/ $9 per month</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => open("pricing")}
              className="rounded-lg bg-mint px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime"
            >
              Open Club Pro checkout
            </button>
            <a
              href="/login"
              className="rounded-lg border border-edge px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-mist transition hover:border-edge2 hover:text-snow"
            >
              Start on the free radar →
            </a>
          </div>
        </div>
      </section>

      <RevenueModel />

      <section className="border-t border-edge">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <div>
            <h2 className="text-2xl font-bold text-snow">
              Get the Monday waste letter
            </h2>
            <p className="mt-2 text-sm text-fog">
              New signatures, one Terraform fix, zero spam.
            </p>
          </div>
          <button
            onClick={() => open("newsletter")}
            className="rounded-lg border border-mint/50 bg-mint/10 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20"
          >
            ✉ Subscribe free
          </button>
        </div>
      </section>
    </>
  );
}
