"use client";

import { Radar, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface NavUser {
  email: string;
  vip: boolean;
}

interface NavHealth {
  db: "connected" | "offline";
  catalogCount: number;
}

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [health, setHealth] = useState<NavHealth | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [sess, hp] = await Promise.all([
        fetch("/api/auth/session").then((r) => r.json()),
        fetch("/api/health").then((r) => r.json()),
      ]);
      setUser(
        sess?.user?.email
          ? { email: sess.user.email, vip: Boolean(sess.vip) }
          : null,
      );
      if (hp?.db) setHealth({ db: hp.db, catalogCount: hp.catalogCount ?? 30 });
    } catch {
      /* nav stays usable even if APIs are down */
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090e]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
            <Radar className="h-5 w-5 text-mint" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-ember pulse-dot" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            CloudTrim<span className="text-mint">AI</span>
          </span>
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 lg:inline">
            v2.6
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 md:flex">
          <Link href="/" className="transition hover:text-white">
            Radar
          </Link>
          <Link href="/#bento-architecture" className="text-mint font-bold transition hover:text-white">
            ✨ Bento Grid
          </Link>
          <Link href="/#pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/#revenue" className="transition hover:text-white">
            Revenue
          </Link>
          <Link href="/watchlists" className="transition hover:text-white">
            Tripwires
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest sm:flex"
            title="Live system status"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                health?.db === "offline"
                  ? "bg-gold"
                  : "bg-mint pulse-dot"
              }`}
            />
            <span className={health?.db === "offline" ? "text-gold" : "text-mint"}>
              {health
                ? health.db === "offline"
                  ? "OFFLINE CATALOG"
                  : `PG LIVE · ${health.catalogCount} SIGS`
                : "SCANNING…"}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {user.vip ? (
                <span className="hidden rounded border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-gold sm:inline">
                  VIP
                </span>
              ) : null}
              <Link
                href="/dashboard"
                className="rounded-lg border border-mint/50 bg-mint/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-mint transition hover:bg-mint/20"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                title={`Sign out (${user.email})`}
                className="rounded-lg border border-edge p-2 text-fog transition hover:border-ember/50 hover:text-ember"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-mint/50 bg-mint/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-mint transition hover:bg-mint/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
