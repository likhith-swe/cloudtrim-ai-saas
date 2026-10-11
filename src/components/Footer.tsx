"use client";

import Link from "next/link";
import {
  CATEGORY_META,
  providerServicePairs,
  serviceSlug,
} from "@/lib/fallback-leaks";
import { useModals } from "./GlobalModals";

export default function Footer() {
  const { open } = useModals();
  const hubs = providerServicePairs().slice(0, 8);

  return (
    <footer className="border-t border-white/10 bg-[#08090d]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand & Pitch */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 p-1">
              <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
                <path
                  d="M44 38C47.3 38 50 35.3 50 32C50 28.9 47.7 26.3 44.7 26.1C44.1 20.4 39.3 16 33.5 16C28.4 16 24.1 19.4 22.8 24.1C22.2 24 21.6 24 21 24C17.1 24 14 27.1 14 31C14 34.9 17.1 38 21 38L44 38Z"
                  fill="url(#footer-grad)"
                />
                <path
                  d="M12 46L52 18"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="footer-grad" x1="12" y1="12" x2="52" y2="52">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#3ddc84" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-base font-bold text-white">
              CloudTrim<span className="text-emerald-400">AI</span>
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-400">
            Institutional-grade FinOps waste radar. We identify the 25–40% of cloud budgets feeding zombie compute, storage, and networking before monthly invoicing closes.
          </p>
          <button
            onClick={() => open("newsletter")}
            className="mt-5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:border-white/30 hover:text-white"
          >
            ✉ Weekly Waste Digest
          </button>
        </div>

        {/* Leak Categories */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Leak Categories
          </h4>
          <ul className="mt-4 space-y-2 text-xs text-zinc-400">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <li key={key}>
                <Link
                  href={`/?category=${key}#radar`}
                  className="transition hover:text-white"
                >
                  {meta.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Radars */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Cloud Providers
          </h4>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-zinc-400 font-mono">
            {hubs.map((h) => (
              <li key={`${h.provider}-${h.service}`}>
                <Link
                  href={`/leaks/${h.provider}/${serviceSlug(h.service)}`}
                  className="transition hover:text-white"
                >
                  {h.provider.toUpperCase()} · {h.service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ethical Transparency */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Monetization Disclosure
          </h4>
          <p className="mt-4 text-xs leading-relaxed text-zinc-400">
            CloudTrim AI operates on verified subscription revenue (₹499 / $9/mo), transparent affiliate links, and modular infrastructure packs.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
            Zero sponsored bias: Outbound partner references never alter leak detection scores or remediation priority.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-zinc-400 sm:px-6">
          <span>© 2026 CloudTrim AI. Real-time Autonomous FinOps Radar.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry System Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
