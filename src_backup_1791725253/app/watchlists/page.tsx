import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current-user";
import { allServices } from "@/lib/fallback-leaks";
import { listAlertEvents, listWatchlists } from "@/lib/queries";
import WatchlistManager from "./WatchlistManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FinOps Tripwires",
  robots: { index: false },
};

export default async function WatchlistsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const [watchlists, alerts] = await Promise.all([
    listWatchlists(user.email),
    listAlertEvents(user.email, 12),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-mint">
        alert trigger manager
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-snow">
        FinOps tripwires
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fog">
        Threshold rules evaluated on every sweep. When a leak crosses your
        line, CloudTrim fires the configured channel — Slack, Telegram,
        WhatsApp or email — with delivery latency logged.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <WatchlistManager
          initial={watchlists}
          email={user.email}
          services={allServices()}
        />

        <div className="rounded-xl border border-edge bg-panel p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-mint">
            delivery log
          </h2>
          {alerts.length === 0 ? (
            <p className="mt-4 text-sm text-fog">
              No dispatches yet. Arm a tripwire and trigger a sweep from the
              dashboard to see latency-tracked deliveries here.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-edge bg-ink/50 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
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
          <p className="mt-4 border-t border-edge pt-3 font-mono text-[10px] text-fog">
            Channels without credentials are logged as{" "}
            <span className="text-gold">skipped</span> — configure env keys to
            light them up.{" "}
            <Link href="/dashboard" className="text-mint underline">
              Run a sweep →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
