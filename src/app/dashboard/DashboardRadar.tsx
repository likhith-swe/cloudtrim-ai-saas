"use client";

import { Crown, RefreshCw, Satellite } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { providerMeta, riskMeta, scoreTone, timeAgo, usdRound } from "@/lib/format";
import type { CloudLeak } from "@/lib/types";

export default function DashboardRadar({
  initialLeaks,
  email,
  vip,
  lastScanAt,
}: {
  initialLeaks: CloudLeak[];
  email: string;
  vip: boolean;
  lastScanAt: string;
}) {
  const router = useRouter();
  const [leaks, setLeaks] = useState<CloudLeak[]>(initialLeaks);
  const [busy, setBusy] = useState<"scan" | "refresh" | "vip" | null>(null);
  const [scanNote, setScanNote] = useState("");
  const [isVip, setIsVip] = useState(vip);
  const [scanStamp, setScanStamp] = useState(lastScanAt);

  const refreshLeaks = async () => {
    try {
      const res = await fetch("/api/leaks?sort=waste");
      const data = await res.json();
      if (Array.isArray(data?.leaks)) {
        setLeaks(data.leaks);
        setScanStamp(new Date().toISOString());
      }
    } catch {
      /* keep previous sweep */
    }
  };

  const runScan = async () => {
    setBusy("scan");
    setScanNote("");
    try {
      const res = await fetch("/api/cron/refresh-leaks", { method: "POST" });
      const data = await res.json();
      if (data?.ok) {
        setScanNote(
          `sweep ok · ${data.scanned} signatures · ${data.tripwiresTriggered} tripwire(s) fired · ${data.alertsDelivered} alert(s) delivered`,
        );
        await refreshLeaks();
        router.refresh();
      } else {
        setScanNote(`sweep rejected — ${data?.error ?? "unknown"}`);
      }
    } catch {
      setScanNote("sweep failed — radar still shows the last good data");
    } finally {
      setBusy(null);
    }
  };

  const activateVip = async () => {
    setBusy("vip");
    try {
      const res = await fetch("/api/billing/sandbox-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data?.ok) {
        setIsVip(true);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const sorted = [...leaks].sort((a, b) => b.monthlyWasteUsd - a.monthlyWasteUsd);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-5 py-4">
        <div className="flex items-center gap-3">
          <Satellite className="h-5 w-5 text-mint" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fog">
              radar status
            </p>
            <p className="font-mono text-xs text-mist">
              last sweep {timeAgo(scanStamp)} · {leaks.length} signatures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshLeaks}
            className="inline-flex items-center gap-2 rounded-lg border border-edge px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-mist transition hover:border-edge2 hover:text-snow"
          >
            <RefreshCw className="h-3.5 w-3.5" /> refresh
          </button>
          <button
            onClick={runScan}
            disabled={busy === "scan"}
            className="inline-flex items-center gap-2 rounded-lg border border-mint/50 bg-mint/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20 disabled:opacity-50"
          >
            <Satellite className="h-3.5 w-3.5" />
            {busy === "scan" ? "sweeping…" : "run scan now"}
          </button>
        </div>
      </div>

      {scanNote ? (
        <p className="rounded-lg border border-edge bg-ink/60 px-4 py-2.5 font-mono text-[11px] text-mint">
          ▸ {scanNote}
        </p>
      ) : null}

      {!isVip ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
              free tier
            </p>
            <p className="mt-1 text-sm text-mist">
              Unlimited tripwires, full catalog and 5-minute scans unlock with
              Club Pro (₹499 / $9).
            </p>
          </div>
          <button
            onClick={activateVip}
            disabled={busy === "vip"}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink transition hover:brightness-110 disabled:opacity-60"
          >
            <Crown className="h-3.5 w-3.5" />
            {busy === "vip" ? "activating…" : "⚡ activate VIP (sandbox)"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] px-5 py-4">
          <Crown className="h-5 w-5 text-gold" />
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold">
            Club Pro VIP active — unlimited tripwires armed
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-edge">
        <div className="hidden grid-cols-[1.4fr_0.7fr_0.9fr_0.7fr_0.6fr_0.9fr] gap-2 border-b border-edge bg-ink/60 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-fog md:grid">
          <span>resource</span>
          <span>provider</span>
          <span>service · region</span>
          <span className="text-right">waste/mo</span>
          <span className="text-right">score</span>
          <span className="text-right">action</span>
        </div>
        {sorted.map((l) => {
          const tone = scoreTone(l.wasteScore);
          const risk = riskMeta(l.riskLevel);
          const prov = providerMeta(l.provider);
          return (
            <div
              key={l.id}
              className="grid grid-cols-2 items-center gap-2 border-b border-edge bg-panel/60 px-4 py-3 transition last:border-b-0 hover:bg-panel md:grid-cols-[1.4fr_0.7fr_0.9fr_0.7fr_0.6fr_0.9fr]"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-semibold text-snow">
                  {l.resourceName}
                </p>
                <p className="truncate text-[10px] text-fog">
                  {l.detectionReason}
                </p>
              </div>
              <span
                className={`hidden w-fit rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest md:inline-block ${prov.chip}`}
              >
                {prov.short}
              </span>
              <span className="hidden truncate font-mono text-[10px] text-mist md:block">
                {l.service} · {l.region}
              </span>
              <span className="text-right font-mono text-sm font-bold text-ember">
                {usdRound(l.monthlyWasteUsd)}
              </span>
              <span className={`text-right font-mono text-sm font-bold ${tone.text}`}>
                {l.wasteScore}
              </span>
              <span className="flex items-center justify-end gap-2">
                <span
                  title={risk.label}
                  className={`hidden rounded border px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase lg:inline ${risk.chip}`}
                >
                  {risk.label.split(" ")[0]}
                </span>
                <Link
                  href={`/leak/${l.id}`}
                  className="rounded border border-edge px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-mint transition hover:border-mint/50 hover:bg-mint/10"
                >
                  fix →
                </Link>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
