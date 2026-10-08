"use client";

import { useState } from "react";
import { ModalHeader, ModalShell } from "./GlobalModals";

const PERKS = [
  "Top 5 new zombie signatures discovered this week",
  "One copy-paste Terraform fix, explained line by line",
  "FinOps math: the WasteScore component of the week",
];

export default function NewsletterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setState("saving");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter-modal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setState("done");
      setMsg(data?.message ?? "Subscribed.");
    } catch (err) {
      setState("error");
      setMsg(
        err instanceof Error && err.message === "invalid_email"
          ? "That email doesn't parse. Try again?"
          : "Subscription failed — try again shortly.",
      );
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        eyebrow="weekly digest"
        title="The Cloud Waste Letter"
        onClose={onClose}
      />
      <div className="px-6 py-5">
        <p className="text-sm text-fog">
          Every Monday, 07:00 UTC: what the radar caught, what it cost, and
          the exact fix. Zero fluff, unsubscribe anytime.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-mist">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-mint">▸</span> {p}
            </li>
          ))}
        </ul>

        {state === "done" ? (
          <p className="mt-5 rounded-lg border border-mint/40 bg-mint/10 px-4 py-3 text-center font-mono text-xs text-mint">
            ✓ {msg}
          </p>
        ) : (
          <div className="mt-5 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@company.dev"
              className="w-full rounded-lg border border-edge bg-ink px-3 py-2.5 font-mono text-sm text-snow placeholder:text-fog/60 focus:border-mint/60 focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={state === "saving" || !email.includes("@")}
              className="shrink-0 rounded-lg border border-mint/50 bg-mint/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20 disabled:opacity-50"
            >
              {state === "saving" ? "…" : "Join"}
            </button>
          </div>
        )}
        {state === "error" ? (
          <p className="mt-3 text-center font-mono text-xs text-ember">✕ {msg}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}
