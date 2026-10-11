"use client";

import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { usdRound } from "@/lib/format";
import type { Watchlist } from "@/lib/types";

export default function WatchlistManager({
  initial,
  email,
  services,
}: {
  initial: Watchlist[];
  email: string;
  services: string[];
}) {
  const [items, setItems] = useState<Watchlist[]>(initial);
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState("any");
  const [service, setService] = useState("any");
  const [threshold, setThreshold] = useState(150);
  const [channel, setChannel] = useState("slack");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const create = async () => {
    setBusy("create");
    setErr("");
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim() || `Tripwire ≥ $${threshold}/mo`,
          provider,
          service,
          minMonthlyWasteUsd: threshold,
          channel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setItems((prev) => [data.watchlist, ...prev]);
      setLabel("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (w: Watchlist) => {
    setBusy(w.id);
    try {
      const res = await fetch(`/api/watchlists/${w.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === w.id ? { ...x, enabled: Boolean(data.enabled) } : x,
          ),
        );
      }
    } finally {
      setBusy(null);
    }
  };

  const remove = async (w: Watchlist) => {
    setBusy(w.id);
    try {
      const res = await fetch(`/api/watchlists/${w.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== w.id));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* create form */}
      <div className="rounded-xl border border-edge bg-panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
          new tripwire · {email}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='label, e.g. "NAT bleed > $200"'
            className="rounded-lg border border-edge bg-ink px-3 py-2.5 font-mono text-sm text-snow placeholder:text-fog/50 focus:border-mint/60 focus:outline-none md:col-span-2"
          />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-lg border border-edge bg-ink px-3 py-2.5 font-mono text-sm text-snow focus:border-mint/60 focus:outline-none"
          >
            <option value="any">any provider</option>
            <option value="aws">AWS</option>
            <option value="gcp">GCP</option>
            <option value="azure">Azure</option>
          </select>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-lg border border-edge bg-ink px-3 py-2.5 font-mono text-sm text-snow focus:border-mint/60 focus:outline-none"
          >
            <option value="any">any service</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="md:col-span-2">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-fog">
              <span>monthly waste threshold</span>
              <span className="font-bold text-ember">≥ ${threshold}/mo</span>
            </div>
            <input
              type="range"
              min={25}
              max={1000}
              step={25}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-edge bg-ink p-1 md:col-span-2">
            {["slack", "telegram", "whatsapp", "email"].map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`flex-1 rounded-md py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition ${
                  channel === c
                    ? "bg-mint/15 text-mint"
                    : "text-fog hover:text-mist"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {err ? (
          <p className="mt-3 font-mono text-xs text-ember">✕ {err}</p>
        ) : null}
        <button
          onClick={create}
          disabled={busy === "create"}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition hover:bg-lime disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {busy === "create" ? "arming…" : "arm tripwire"}
        </button>
      </div>

      {/* list */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge px-6 py-12 text-center font-mono text-xs uppercase tracking-widest text-fog">
          no tripwires armed — the radar sweeps silently
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((w) => (
            <li
              key={w.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-edge bg-panel px-4 py-3.5"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  w.enabled ? "bg-mint pulse-dot" : "bg-fog/40"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold text-snow">
                  {w.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
                  {w.provider} · {w.service} · ≥{" "}
                  {usdRound(w.minMonthlyWasteUsd)}/mo · via {w.channel}
                </p>
              </div>
              <button
                onClick={() => toggle(w)}
                disabled={busy === w.id}
                title={w.enabled ? "Pause tripwire" : "Arm tripwire"}
                className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                  w.enabled
                    ? "border-mint/40 text-mint hover:bg-mint/10"
                    : "border-edge text-fog hover:text-mist"
                }`}
              >
                {w.enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => remove(w)}
                disabled={busy === w.id}
                title="Delete tripwire"
                className="rounded-lg border border-edge p-2 text-fog transition hover:border-ember/50 hover:text-ember disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
