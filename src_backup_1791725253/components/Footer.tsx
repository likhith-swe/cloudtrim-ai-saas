"use client";

import { Radar } from "lucide-react";
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
    <footer className="border-t border-edge bg-panel/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-mint" />
            <span className="text-base font-bold text-snow">
              CloudTrim<span className="text-mint">AI</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fog">
            Institutional-grade FinOps radar. We find the 25–40% of your cloud
            budget feeding zombies — then hand you the exact Terraform fix.
          </p>
          <button
            onClick={() => open("newsletter")}
            className="mt-5 rounded-lg border border-edge px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-mist transition hover:border-mint/50 hover:text-mint"
          >
            ✉ Weekly waste digest
          </button>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            Leak categories
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <li key={key}>
                <Link
                  href={`/?category=${key}#radar`}
                  className="transition hover:text-mint"
                >
                  {meta.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            Service radars
          </h4>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-fog">
            {hubs.map((h) => (
              <li key={`${h.provider}-${h.service}`}>
                <Link
                  href={`/leaks/${h.provider}/${serviceSlug(h.service)}`}
                  className="font-mono text-xs transition hover:text-mint"
                >
                  {h.provider.toUpperCase()} / {h.service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            Monetized with transparency
          </h4>
          <p className="mt-4 text-xs leading-relaxed text-fog">
            CloudTrim AI earns revenue from Club Pro subscriptions (₹499 /
            $9 per month), clearly-labelled affiliate links, remediation
            templates and sponsored radar slots. Free radars stay free. See the
            full breakdown on the home page.
          </p>
          <p className="mt-4 text-[11px] text-fog/70">
            Affiliate disclosure: outbound partner links may carry tracking
            parameters that pay us a commission at zero cost to you.
          </p>
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 font-mono text-[10px] uppercase tracking-widest text-fog sm:px-6">
          <span>© 2026 CloudTrim AI — trim before the invoice hits</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
            radar operational
          </span>
        </div>
      </div>
    </footer>
  );
}
