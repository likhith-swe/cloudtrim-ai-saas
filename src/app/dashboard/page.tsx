import { BellRing, Flame, Gauge, PiggyBank } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardRadar from "./DashboardRadar";
import { currentUser } from "@/lib/auth/current-user";
import { timeAgo, usdRound } from "@/lib/format";
import {
  getActiveSubscription,
  getStats,
  listAlertEvents,
  listLeaks,
  listWatchlists,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mission Control",
  robots: { index: false },
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const [leaks, stats, sub, watchlists, alerts] = await Promise.all([
    listLeaks(),
    getStats(),
    getActiveSubscription(user.email),
    listWatchlists(user.email),
    listAlertEvents(user.email, 8),
  ]);
  const vip = sub?.status === "active" || user.vip;

  const cards = [
    {
      icon: <PiggyBank className="h-4 w-4" />,
      label: "monthly burn detected",
      value: usdRound(stats.totalMonthlyWasteMinor),
      tone: "text-ember",
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "annual runway at risk",
      value: usdRound(stats.totalMonthlyWasteMinor * 12),
      tone: "text-ember",
    },
    {
      icon: <Gauge className="h-4 w-4" />,
      label: "high-impact leaks",
      value: String(stats.highImpactCount),
      tone: "text-gold",
    },
    {
      icon: <BellRing className="h-4 w-4" />,
      label: "armed tripwires",
      value: String(watchlists.filter((w) => w.enabled).length),
      tone: "text-mint",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
            mission control
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-snow">
            Live leak radar
          </h1>
          <p className="mt-1 font-mono text-xs text-fog">
            operator <span className="text-mist">{user.email}</span> · last
            sweep {timeAgo(stats.lastScanAt)}
          </p>
        </div>
        <Link
          href="/watchlists"
          className="rounded-lg border border-gold/50 bg-gold/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gold transition hover:bg-gold/20"
        >
          ⚡ Manage tripwires
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-edge bg-panel p-5"
          >
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-fog">
              {c.icon}
              {c.label}
            </div>
            <p className={`mt-3 font-mono text-2xl font-bold ${c.tone}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <DashboardRadar
          initialLeaks={leaks}
          email={user.email}
          vip={vip}
          lastScanAt={stats.lastScanAt}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-edge bg-panel p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            your tripwires
          </h2>
          {watchlists.length === 0 ? (
            <p className="mt-4 text-sm text-fog">
              No tripwires armed yet.{" "}
              <Link href="/watchlists" className="text-mint underline">
                Create one
              </Link>{" "}
              and the radar will ping you before billing closes.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {watchlists.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-ink/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-snow">
                      {w.label}
                    </p>
                    <p className="font-mono text-[10px] text-fog">
                      {w.provider.toUpperCase()} · {w.service} · ≥{" "}
                      {usdRound(w.minMonthlyWasteUsd)}/mo · via {w.channel}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                      w.enabled
                        ? "border-mint/40 bg-mint/10 text-mint"
                        : "border-edge text-fog"
                    }`}
                  >
                    {w.enabled ? "armed" : "paused"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-edge bg-panel p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            alert feed
          </h2>
          {alerts.length === 0 ? (
            <p className="mt-4 text-sm text-fog">
              Quiet so far. Alerts fire when a sweep finds a leak crossing one
              of your thresholds.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-edge bg-ink/50 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest">
                    <span
                      className={
                        a.status === "delivered"
                          ? "text-mint"
                          : a.status === "skipped"
                            ? "text-gold"
                            : "text-ember"
                      }
                    >
                      {a.status} · {a.channel}
                    </span>
                    <span className="text-fog">{a.latencyMs}ms</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-mist">
                    {a.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
