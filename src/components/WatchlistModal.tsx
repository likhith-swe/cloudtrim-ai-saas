"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { allServices } from "@/lib/fallback-leaks";
import type { CloudLeak } from "@/lib/types";
import { ModalHeader, ModalShell } from "./GlobalModals";

export default function WatchlistModal({
  onClose,
  presetLeak,
}: {
  onClose: () => void;
  presetLeak: CloudLeak | null;
}) {
  const [auth, setAuth] = useState<"loading" | "anon" | string>("loading");
  const [label, setLabel] = useState(
    presetLeak ? `Tripwire: ${presetLeak.service} burn` : "Tripwire: any big leak",
  );
  const [provider, setProvider] = useState<string>(
    presetLeak?.provider ?? "any",
  );
  const [service, setService] = useState<string>(
    presetLeak?.service ?? "any",
  );
  const [threshold, setThreshold] = useState<number>(
    presetLeak ? Math.max(25, Math.ceil(presetLeak.monthlyWasteUsd / 100 / 25) * 25) : 150,
  );
  const [channel, setChannel] = useState<string>("slack");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuth(d?.user?.email ? d.user.email : "anon"))
      .catch(() => setAuth("anon"));
  }, []);

  const submit = async () => {
    setState("saving");
    setErrMsg("");
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          provider,
          service,
          minMonthlyWasteUsd: threshold,
          channel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setState("done");
    } catch (err) {
      setState("error");
      setErrMsg(err instanceof Error ? err.message : "failed");
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        eyebrow="finops tripwire"
        title="Arm a waste alert"
        onClose={onClose}
      />
      <div className="px-6 py-5">
        {auth === "loading" ? (
          <p className="py-8 text-center font-mono text-xs text-fog">
            checking session…
          </p>
        ) : auth === "anon" ? (
          <div className="py-4 text-center">
            <p className="text-sm text-fog">
              Tripwires need a (passwordless) account so alerts know where to
              go.
            </p>
            <Link
              href="/login"
              onClick={onClose}
              className="mt-4 inline-block rounded-lg border border-mint/50 bg-mint/10 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-mint hover:bg-mint/20"
            >
              Sign in with magic link →
            </Link>
          </div>
        ) : state === "done" ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-mint/50 bg-mint/10">
              <span className="h-2.5 w-2.5 rounded-full bg-mint pulse-dot" />
            </span>
            <p className="mt-4 font-mono text-sm font-semibold text-mint">
              TRIPWIRE ARMED
            </p>
            <p className="mt-2 text-sm text-fog">
              &ldquo;{label}&rdquo; fires when a matching leak crosses{" "}
              <span className="text-snow">${threshold}/mo</span>. Manage it on
              the <Link href="/watchlists" className="text-mint underline">tripwire page</Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
                tripwire name
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-edge bg-ink px-3 py-2 font-mono text-sm text-snow focus:border-mint/60 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-fog">
                  provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0c1017] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="any">any</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">GCP</option>
                  <option value="azure">Azure</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400">
                  service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0c1017] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="any">any</option>
                  {allServices().map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400">
                  monthly waste threshold
                </label>
                <span className="font-mono text-xs font-bold text-amber-400">
                  ≥ ${threshold}/mo
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={1000}
                step={25}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-2 w-full accent-white cursor-pointer"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400">
                alert channel
              </label>
              <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {["slack", "telegram", "whatsapp", "email"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={`rounded-lg py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition ${
                      channel === c
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {state === "error" ? (
              <p className="font-mono text-xs text-red-400">
                ✕ {errMsg} — try again
              </p>
            ) : null}

            <button
              onClick={submit}
              disabled={state === "saving" || !label.trim()}
              className="w-full rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
            >
              {state === "saving" ? "Arming…" : "⚡ Arm Tripwire Alert"}
            </button>
            <p className="text-center font-mono text-[10px] text-fog">
              signed in as <span className="text-mist">{auth}</span>
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
