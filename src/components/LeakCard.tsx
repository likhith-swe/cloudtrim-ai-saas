"use client";

import { MapPin, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { providerMeta, riskMeta, scoreTone, usdRound } from "@/lib/format";
import { isHighImpactLeak } from "@/lib/waste-score";
import type { CloudLeak } from "@/lib/types";
import { useModals } from "./GlobalModals";
import BeamCard from "@/components/ui/beam-card";

export default function LeakCard({ leak }: { leak: CloudLeak }) {
  const { open } = useModals();
  const tone = scoreTone(leak.wasteScore);
  const risk = riskMeta(leak.riskLevel);
  const provider = providerMeta(leak.provider);
  const highImpact = isHighImpactLeak(leak.wasteScore, leak.monthlyWasteUsd);

  return (
    <BeamCard
      enableTilt={true}
      beamColor={highImpact ? "white" : "white"}
      className="h-full"
      innerClassName="p-5 flex flex-col justify-between h-full bg-[#090d16]/90 border-white/10 group-hover:border-white/20 transition-all duration-300"
    >
      <div>
        {highImpact ? (
          <div className="mb-3 flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full border border-ember/40 bg-ember/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ember shadow-sm shadow-ember/20">
              <Zap className="h-2.5 w-2.5" />
              high impact
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${provider.chip}`}
          >
            {provider.short}
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-medium">
            {leak.service}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
            <MapPin className="h-3 w-3 text-zinc-500" />
            {leak.region}
          </span>
        </div>

        <h3 className="mt-3 truncate font-mono text-sm font-bold text-white tracking-tight group-hover:text-mint transition-colors">
          {leak.resourceName}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5em] text-xs leading-relaxed text-zinc-400">
          {leak.detectionReason}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between border-t border-white/10 pt-4">
          <div>
            <div className="font-mono text-2xl font-extrabold text-ember">
              {usdRound(leak.monthlyWasteUsd)}
              <span className="text-xs font-normal text-zinc-400">/mo</span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
              waste detected
            </div>
          </div>
          <div className="text-right">
            <div className={`font-mono text-2xl font-extrabold ${tone.text}`}>
              {leak.wasteScore}
            </div>
            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full ${tone.bar}`}
                style={{ width: `${leak.wasteScore}%` }}
              />
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
              wastescore
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider ${risk.chip}`}
          >
            {risk.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/leak/${leak.id}`}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-300 transition hover:bg-white/15 hover:border-white/30 hover:text-white"
            >
              Audit
            </Link>
            <button
              onClick={() => open("remediation", leak)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-mint/40 bg-mint/15 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/25 hover:border-mint/60 shadow-sm shadow-mint/10"
            >
              <Terminal className="h-3 w-3" />
              1-click fix
            </button>
          </div>
        </div>
      </div>
    </BeamCard>
  );
}
