"use client";

import { X, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useModals } from "./GlobalModals";

const HIDDEN_ON = ["/dashboard", "/watchlists", "/login"];

/** Floating upgrade bar shown across the marketing console. */
export default function OpenPricingCta() {
  const pathname = usePathname();
  const { open } = useModals();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("ct-cta-dismissed") === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("ct-cta-dismissed", "1");
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
      <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0d1017]/90 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="flex-1 text-xs leading-relaxed text-zinc-300">
          Cloud waste compounds hourly.{" "}
          <span className="font-semibold text-white">Club Pro</span> monitors 24/7 from{" "}
          <span className="font-semibold text-white">₹499</span> /{" "}
          <span className="font-semibold text-white">$9</span> per month.
        </p>
        <button
          onClick={() => open("pricing")}
          className="shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 shadow-sm"
        >
          Upgrade
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss upgrade bar"
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
