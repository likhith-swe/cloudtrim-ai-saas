"use client";

import { useState } from "react";
import type { CloudLeak, LeakSort } from "@/lib/types";
import LeakCard from "./LeakCard";

const SORTS: { key: LeakSort; label: string }[] = [
  { key: "waste", label: "$ waste" },
  { key: "score", label: "score" },
  { key: "recent", label: "newest" },
];

export default function LeakGrid({ leaks }: { leaks: CloudLeak[] }) {
  const [sort, setSort] = useState<LeakSort>("waste");

  const sorted = [...leaks].sort((a, b) => {
    if (sort === "score") return b.wasteScore - a.wasteScore;
    if (sort === "recent") {
      return Date.parse(b.firstSeenAt) - Date.parse(a.firstSeenAt);
    }
    return b.monthlyWasteUsd - a.monthlyWasteUsd;
  });

  return (
    <div id="radar">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
          <span className="text-mint">{sorted.length}</span> leak signatures on
          scope
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-edge bg-panel p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-md px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
                sort === s.key
                  ? "bg-mint/15 text-mint"
                  : "text-fog hover:text-mist"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-edge py-20 text-center">
          <div className="relative h-24 w-24 rounded-full border border-edge2">
            <div className="radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(61,220,132,0.3),transparent_70deg)]" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-fog">
            No leaks match this sweep — widen the filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((leak) => (
            <LeakCard key={leak.id} leak={leak} />
          ))}
        </div>
      )}
    </div>
  );
}
