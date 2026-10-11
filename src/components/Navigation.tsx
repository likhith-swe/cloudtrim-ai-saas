"use client";

import { LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 p-1.5 shadow-sm group-hover:border-white/30 transition-all">
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
              <path
                d="M44 38C47.3 38 50 35.3 50 32C50 28.9 47.7 26.3 44.7 26.1C44.1 20.4 39.3 16 33.5 16C28.4 16 24.1 19.4 22.8 24.1C22.2 24 21.6 24 21 24C17.1 24 14 27.1 14 31C14 34.9 17.1 38 21 38L44 38Z"
                fill="url(#nav-grad)"
              />
              <path
                d="M12 46L52 18"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="32" cy="32" r="3" fill="#ffffff" />
              <defs>
                <linearGradient id="nav-grad" x1="12" y1="12" x2="52" y2="52">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#3ddc84" />
                  <stop offset="100%" stopColor="#b7ee4f" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
              CloudTrim<span className="text-emerald-400">AI</span>
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline">
              v2.6
            </span>
          </div>
        </Link>

        {/* Clean Modern Nav Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
          <Link href="/" className="hover:text-white transition-colors duration-150">
            Radar
          </Link>
          <Link
            href="/#bento-architecture"
            className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors duration-150"
          >
            <span className="text-emerald-400">✨</span>
            <span>Bento Grid</span>
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors duration-150">
            Pricing
          </Link>
          <Link href="/#revenue" className="hover:text-white transition-colors duration-150">
            Monetization
          </Link>
          <Link href="/watchlists" className="hover:text-white transition-colors duration-150">
            Tripwires
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400 sm:flex"
            title="Live telemetry health"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                health?.db === "offline"
                  ? "bg-amber-400"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span className="font-mono text-[11px] text-zinc-300">
              {health
                ? health.db === "offline"
                  ? "Offline Catalog"
                  : `Online · ${health.catalogCount} Signatures`
                : "Scanning…"}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {user.vip ? (
                <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 sm:inline">
                  VIP Club
                </span>
              ) : null}
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 hover:border-white/30"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                title={`Sign out (${user.email})`}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
