"use client";

import { Check, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModalShell } from "./GlobalModals";

const PRO_FEATURES = [
  "All 30+ verified cloud leak signatures & custom rules",
  "Unlimited tripwires (Slack, Telegram, WhatsApp, Email)",
  "1-click Terraform & OpenTofu remediation modules",
  "Continuous 5-minute telemetry scan freshness",
  "90-day WasteScore burn-down & compliance reports",
  "Direct channel to FinOps cost engineering team",
];

export default function PricingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const checkout = async () => {
    const provider = currency === "inr" ? "razorpay" : "stripe";
    setBusy(provider);
    setNote("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data?.url) {
        if (data.simulated) setNote("Sandbox mode: instant VIP granted (no live keys configured).");
        window.open(data.url, "_blank", "noopener");
        if (data.simulated) router.refresh();
      }
    } catch {
      setNote("Checkout initialisation failed — try sandbox activation.");
    } finally {
      setBusy(null);
    }
  };

  const sandbox = async () => {
    setBusy("sandbox");
    setNote("");
    try {
      const res = await fetch("/api/billing/sandbox-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.ok) {
        setNote("VIP status activated for this session.");
        router.refresh();
      }
    } catch {
      setNote("Sandbox activation failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <ModalShell onClose={onClose} wide>
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <Zap className="h-3 w-3" /> Club Pro
              </span>
              <span className="text-xs text-zinc-400">Immediate ROI</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Eliminate cloud zombies autonomously
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              One flat monthly membership. Stop 25–40% cloud budget waste before invoices close.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Currency / Region Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setCurrency("inr")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                currency === "inr"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🇮🇳 India (Razorpay · ₹499/mo)
            </button>
            <button
              onClick={() => setCurrency("usd")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                currency === "usd"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🌐 Global (Stripe · $9/mo)
            </button>
          </div>
        </div>

        {/* Main Pro Card */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Membership Tier
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">
                CloudTrim Club Pro
              </h3>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {currency === "inr" ? "₹499" : "$9"}
                </span>
                <span className="text-sm font-medium text-zinc-400">/ month</span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                {currency === "inr" ? "Inclusive of GST · Cancel anytime" : "Cancel anytime · No lock-in"}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            {PRO_FEATURES.map((feat) => (
              <div key={feat} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-xs leading-relaxed text-zinc-300">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="mt-8">
            <button
              onClick={checkout}
              disabled={busy !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200 shadow-lg shadow-white/5 disabled:opacity-50"
            >
              {busy ? "Opening Checkout…" : `Subscribe for ${currency === "inr" ? "₹499/mo" : "$9/mo"} →`}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Processed securely via {currency === "inr" ? "Razorpay" : "Stripe"} · Instant automated activation
              </span>
            </p>
          </div>
        </div>

        {/* Status or QA fallback */}
        {note ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs text-zinc-300">
            {note}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-zinc-400">
          <span>Enterprise or custom billing? Contact support.</span>
          <button
            onClick={sandbox}
            disabled={busy !== null}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Activate Instant VIP Sandbox Test →
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
