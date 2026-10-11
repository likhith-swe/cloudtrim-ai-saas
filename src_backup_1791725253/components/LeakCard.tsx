"use client";

import { MapPin, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { providerMeta, riskMeta, scoreTone, usdRound } from "@/lib/format";
import { isHighImpactLeak } from "@/lib/waste-score";
import type { CloudLeak } from "@/lib/types";
import { useModals } from "./GlobalModals";

export default function LeakCard({ leak }: { leak: CloudLeak }) {
  const { open } = useModals();
  const tone = scoreTone(leak.wasteScore);
  const risk = riskMeta(leak.riskLevel);
  const provider = providerMeta(leak.provider);
  const highImpact = isHighImpactLeak(leak.wasteScore, leak.monthlyWasteUsd);

  return (
    <article className="panel-glow group relative flex flex-col rounded-xl border border-edge bg-panel p-5 transition duration-200">
      {highImpact ? (
        <span className="absolute -top-2.5 right-4 rounded border border-ember/50 bg-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ember">
          ⚠ high impact
        </span>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${provider.chip}`}
        >
          {provider.short}
        </span>
        <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-mist">
          {leak.service}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-fog">
          <MapPin className="h-3 w-3" />
          {leak.region}
        </span>
      </div>

      <h3 className="mt-3 truncate font-mono text-sm font-semibold text-snow">
        {leak.resourceName}
      </h3>
      <p className="mt-1.5 line-clamp-2 min-h-[2.4em] text-xs leading-relaxed text-fog">
        {leak.detectionReason}
      </p>

      <div className="mt-4 flex items-end justify-between border-t border-edge pt-4">
        <div>
          <div className="font-mono text-2xl font-bold text-ember">
            {usdRound(leak.monthlyWasteUsd)}
            <span className="text-xs font-normal text-fog">/mo</span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-fog">
            waste detected
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-2xl font-bold ${tone.text}`}>
            {leak.wasteScore}
          </div>
          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-edge">
            <div
              className={`h-full ${tone.bar}`}
              style={{ width: `${leak.wasteScore}%` }}
            />
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-fog">
            wastescore
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider ${risk.chip}`}
        >
          {risk.label}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/leak/${leak.id}`}
            className="rounded-lg border border-edge px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-mist transition hover:border-edge2 hover:text-snow"
          >
            Audit
          </Link>
          <button
            onClick={() => open("remediation", leak)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-mint/50 bg-mint/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-mint transition hover:bg-mint/20"
          >
            <Terminal className="h-3 w-3" />
            1-click fix
          </button>
        </div>
      </div>

      {highImpact ? (
        <Zap className="absolute bottom-4 left-4 hidden" aria-hidden />
      ) : null}
    </article>
  );
}
