import { Flame } from "lucide-react";
import { usdRound } from "@/lib/format";
import type { CloudLeak } from "@/lib/types";

/** Smooth infinite marquee of the highest-waste assets on the radar. */
export default function WasteTicker({ leaks }: { leaks: CloudLeak[] }) {
  const top = [...leaks]
    .sort((a, b) => b.monthlyWasteUsd - a.monthlyWasteUsd)
    .slice(0, 12);

  const items = (keyPrefix: string) =>
    top.map((l) => (
      <span
        key={`${keyPrefix}-${l.id}`}
        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide"
      >
        <Flame className="h-3.5 w-3.5 text-ember" />
        <span className="text-mist">{l.resourceName}</span>
        <span className="text-fog">· {l.service} ·</span>
        <span className="font-semibold text-ember">
          {usdRound(l.monthlyWasteUsd)}/mo
        </span>
        <span className="text-fog">
          (score {l.wasteScore})
        </span>
        <span className="mx-4 text-edge2">▮</span>
      </span>
    ));

  return (
    <div className="marquee overflow-hidden border-y border-edge bg-panel/60 py-2.5">
      <div className="marquee-track flex w-max whitespace-nowrap">
        <div className="flex items-center">{items("a")}</div>
        <div className="flex items-center" aria-hidden="true">
          {items("b")}
        </div>
      </div>
    </div>
  );
}
