"use client";

import { X } from "lucide-react";
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
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-edge2 bg-panel/95 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur">
        <span className="hidden h-2 w-2 shrink-0 rounded-full bg-ember pulse-dot sm:block" />
        <p className="flex-1 font-mono text-[11px] leading-snug text-mist">
          Zombies are billing right now.{" "}
          <span className="text-snow">Club Pro</span> watches 24/7 —{" "}
          <span className="font-bold text-mint">₹499</span> /{" "}
          <span className="font-bold text-mint">$9</span> per month.
        </p>
        <button
          onClick={() => open("pricing")}
          className="shrink-0 rounded-lg bg-mint px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime"
        >
          Upgrade
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss upgrade bar"
          className="shrink-0 rounded-md border border-edge p-1.5 text-fog transition hover:text-snow"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
