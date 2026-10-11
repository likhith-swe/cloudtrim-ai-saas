"use client";

import { Check, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModalHeader, ModalShell } from "./GlobalModals";

const PRO_FEATURES = [
  "All 30+ verified leak signatures & custom radars",
  "Unlimited FinOps tripwires (Slack · Telegram · WhatsApp · Email)",
  "Terraform + CLI remediation packs with audit trail",
  "WasteScore history & monthly burn-down reports",
  "Priority scan queue — 5 minute freshness",
];

export default function PricingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [vipDone, setVipDone] = useState(false);
  const [note, setNote] = useState("");

  const checkout = async (provider: "razorpay" | "stripe") => {
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
        if (data.simulated) setNote("Sandbox mode: instant VIP granted (no Stripe keys configured).");
        window.open(data.url, "_blank", "noopener");
        if (data.simulated) router.refresh();
      }
    } catch {
      setNote("Checkout failed — try the sandbox activation below.");
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
        setVipDone(true);
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
      <ModalHeader
        eyebrow="club pro"
        title="Stop paying for zombies"
        onClose={onClose}
      />
      <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-edge bg-ink/60 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fog">
            free radar
          </p>
          <p className="mt-2 text-3xl font-bold text-snow">
            $0<span className="text-sm font-normal text-fog"> forever</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-fog">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> Top-10
              leak signatures, live radar
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> 1 tripwire
              on email
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> CLI
              remediation commands
            </li>
          </ul>
          <p className="mt-5 border-t border-edge pt-4 font-mono text-[10px] text-fog">
            No card. No trial clock. The free tier is the demo.
          </p>
        </div>

        {/* Pro */}
        <div className="relative rounded-xl border border-mint/50 bg-mint/[0.06] p-5">
          <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded border border-gold/50 bg-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold">
            <Crown className="h-3 w-3" /> best value
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            club pro
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-snow">₹499<span className="text-sm font-normal text-fog">/mo</span></p>
            <p className="text-xl font-semibold text-mist">
              $9<span className="text-sm font-normal text-fog">/mo</span>
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => checkout("razorpay")}
              disabled={busy !== null}
              className="rounded-lg bg-mint px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime disabled:opacity-60"
            >
              {busy === "razorpay" ? "…" : "₹499 · India"}
            </button>
            <button
              onClick={() => checkout("stripe")}
              disabled={busy !== null}
              className="rounded-lg border border-mint/60 bg-mint/10 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20 disabled:opacity-60"
            >
              {busy === "stripe" ? "…" : "$9 · Global"}
            </button>
          </div>
          <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-widest text-fog">
            India pays via Razorpay link · global via Stripe Checkout
          </p>
        </div>
      </div>

      <div className="border-t border-edge px-6 py-4">
        {vipDone ? (
          <p className="text-center font-mono text-xs font-semibold text-lime">
            ✦ VIP ACTIVE — welcome to Club Pro. Dashboard unlocked.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
              QA corner: no payment rails configured?
            </p>
            <button
              onClick={sandbox}
              disabled={busy !== null}
              className="rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gold transition hover:bg-gold/20 disabled:opacity-60"
            >
              {busy === "sandbox" ? "activating…" : "⚡ 1-click VIP test activation"}
            </button>
          </div>
        )}
        {note ? (
          <p className="mt-2 text-center font-mono text-[10px] text-gold">{note}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}
