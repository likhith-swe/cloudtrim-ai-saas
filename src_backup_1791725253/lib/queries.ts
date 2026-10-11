/**
 * Unified data-access layer.
 *
 * Every function first tries Postgres through withDb(); on any failure it
 * degrades to the global in-memory store (`globalThis.__ctMem`) seeded from
 * the verified 30-leak offline catalog. Nothing in here may throw because
 * the database is down.
 */

import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { withDb, type Db } from "@/db";
import * as t from "@/db/schema";
import { broadcastAlert, type BroadcastSummary } from "./notify";
import { FALLBACK_LEAKS } from "./fallback-leaks";
import { usdRound } from "./format";
import { isHighImpactLeak } from "./waste-score";
import {
  RISK_ORDER,
  type AlertChannel,
  type AlertEvent,
  type CloudLeak,
  type CatalogStats,
  type ChannelResult,
  type LeakFilters,
  type NewsletterSubscriber,
  type Provider,
  type RemediationRecord,
  type Subscription,
  type Watchlist,
} from "./types";

// ─── Global in-memory store (offline backbone) ─────────────────────────

export interface CtMem {
  leaks: CloudLeak[];
  watchlists: Watchlist[];
  alerts: AlertEvent[];
  subscribers: Map<string, NewsletterSubscriber>;
  subscriptions: Map<string, Subscription>;
  profiles: Map<string, { email: string; vip: boolean; lastLoginAt: string }>;
  remediations: RemediationRecord[];
  magicTokens: Map<string, { email: string; exp: number; used: boolean }>;
  state: Map<string, string>;
  lastScanAt: string;
}

const g = globalThis as typeof globalThis & { __ctMem?: CtMem };

export function mem(): CtMem {
  if (!g.__ctMem) {
    g.__ctMem = {
      leaks: FALLBACK_LEAKS.map((l) => ({ ...l, metrics: { ...l.metrics } })),
      watchlists: [],
      alerts: [],
      subscribers: new Map(),
      subscriptions: new Map(),
      profiles: new Map(),
      remediations: [],
      magicTokens: new Map(),
      state: new Map(),
      lastScanAt: new Date().toISOString(),
    };
  }
  return g.__ctMem;
}

// ─── Row mappers ────────────────────────────────────────────────────────

type LeakRow = typeof t.leaks.$inferSelect;

function rowToLeak(row: LeakRow): CloudLeak {
  let metrics = FALLBACK_LEAKS.find((l) => l.id === row.id)?.metrics;
  try {
    metrics = JSON.parse(row.metricsJson);
  } catch {
    /* keep catalog metrics */
  }
  return {
    id: row.id,
    resourceName: row.resourceName,
    provider: row.provider as Provider,
    region: row.region,
    service: row.service,
    category: row.category as CloudLeak["category"],
    monthlyWasteUsd: row.monthlyWasteUsd,
    wasteScore: row.wasteScore,
    detectionReason: row.detectionReason,
    riskLevel: row.riskLevel as CloudLeak["riskLevel"],
    remediationScriptTerraform: row.terraformScript,
    remediationScriptCli: row.cliScript,
    metrics:
      metrics ?? {
        idleCpuHours: 0,
        orphanGb: 0,
        egressCostMonthly: 0,
        overprovisionedRamGb: 0,
        zeroIoDays: 0,
        environment: "unknown",
      },
    firstSeenAt:
      row.firstSeenAt instanceof Date
        ? row.firstSeenAt.toISOString()
        : String(row.firstSeenAt),
  };
}

function leakToRow(l: CloudLeak) {
  return {
    id: l.id,
    resourceName: l.resourceName,
    provider: l.provider,
    region: l.region,
    service: l.service,
    category: l.category,
    monthlyWasteUsd: l.monthlyWasteUsd,
    wasteScore: l.wasteScore,
    detectionReason: l.detectionReason,
    riskLevel: l.riskLevel,
    terraformScript: l.remediationScriptTerraform,
    cliScript: l.remediationScriptCli,
    metricsJson: JSON.stringify(l.metrics),
    firstSeenAt: new Date(l.firstSeenAt),
  };
}

async function seedLeaks(db: Db): Promise<void> {
  try {
    await db
      .insert(t.leaks)
      .values(FALLBACK_LEAKS.map(leakToRow))
      .onConflictDoNothing();
  } catch {
    /* seeding is best-effort; the catalog still serves from memory */
  }
}

// ─── Filtering ──────────────────────────────────────────────────────────

export function applyFilters(
  list: CloudLeak[],
  f: LeakFilters = {},
): CloudLeak[] {
  let out = list;
  if (f.provider && f.provider !== "all") {
    out = out.filter((l) => l.provider === f.provider);
  }
  if (f.service && f.service !== "all") {
    out = out.filter((l) => l.service === f.service);
  }
  if (f.category && f.category !== "all") {
    out = out.filter((l) => l.category === f.category);
  }
  if (typeof f.minScore === "number") {
    out = out.filter((l) => l.wasteScore >= (f.minScore as number));
  }
  if (typeof f.minWasteMinor === "number") {
    out = out.filter(
      (l) => l.monthlyWasteUsd >= (f.minWasteMinor as number),
    );
  }
  if (f.maxRisk) {
    const cap = RISK_ORDER[f.maxRisk];
    out = out.filter((l) => RISK_ORDER[l.riskLevel] <= cap);
  }
  if (f.q && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    out = out.filter((l) =>
      [l.id, l.resourceName, l.service, l.region, l.detectionReason, l.provider]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  const sort = f.sort ?? "waste";
  return [...out].sort((a, b) => {
    if (sort === "score") return b.wasteScore - a.wasteScore;
    if (sort === "recent") {
      return Date.parse(b.firstSeenAt) - Date.parse(a.firstSeenAt);
    }
    return b.monthlyWasteUsd - a.monthlyWasteUsd;
  });
}

// ─── Leaks ──────────────────────────────────────────────────────────────

export async function listLeaks(filters: LeakFilters = {}): Promise<CloudLeak[]> {
  const rows = await withDb<CloudLeak[]>(
    async (db) => {
      const found = await db.select().from(t.leaks);
      if (found.length === 0) {
        await seedLeaks(db);
        return FALLBACK_LEAKS;
      }
      return found.map(rowToLeak);
    },
    () => mem().leaks,
  );
  return applyFilters(rows, filters);
}

export async function getLeak(id: string): Promise<CloudLeak | null> {
  return withDb<CloudLeak | null>(
    async (db) => {
      const found = await db
        .select()
        .from(t.leaks)
        .where(eq(t.leaks.id, id))
        .limit(1);
      if (found.length === 0) {
        // Row may not exist yet if seeding hasn't run; consult the catalog.
        return FALLBACK_LEAKS.find((l) => l.id === id) ?? null;
      }
      return rowToLeak(found[0]);
    },
    () => mem().leaks.find((l) => l.id === id) ?? null,
  );
}

export async function getStats(): Promise<CatalogStats> {
  const leaks = await listLeaks();
  const total = leaks.reduce((acc, l) => acc + l.monthlyWasteUsd, 0);
  const highImpact = leaks.filter((l) =>
    isHighImpactLeak(l.wasteScore, l.monthlyWasteUsd),
  ).length;
  const avg =
    leaks.length === 0
      ? 0
      : Math.round(leaks.reduce((a, l) => a + l.wasteScore, 0) / leaks.length);
  const top = [...leaks].sort((a, b) => b.monthlyWasteUsd - a.monthlyWasteUsd)[0];
  const lastScanAt =
    (await getState("last_scan_at")) ?? mem().lastScanAt;
  return {
    leakCount: leaks.length,
    totalMonthlyWasteMinor: total,
    highImpactCount: highImpact,
    avgScore: avg,
    topLeakId: top?.id ?? null,
    lastScanAt,
  };
}

// ─── Watchlists (FinOps tripwires) ──────────────────────────────────────

type WatchlistInput = {
  email: string;
  label: string;
  provider: Watchlist["provider"];
  service: string;
  minMonthlyWasteUsd: number;
  channel: AlertChannel;
};

type WatchlistRow = typeof t.userWatchlists.$inferSelect;

function watchlistFromRow(r: WatchlistRow): Watchlist {
  return {
    id: r.id,
    email: r.email,
    label: r.label,
    provider: r.provider as Watchlist["provider"],
    service: r.service,
    minMonthlyWasteUsd: r.minMonthlyWasteUsd,
    channel: r.channel as AlertChannel,
    enabled: r.enabled,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt),
    lastTriggeredAt: r.lastTriggeredAt
      ? r.lastTriggeredAt instanceof Date
        ? r.lastTriggeredAt.toISOString()
        : String(r.lastTriggeredAt)
      : null,
  };
}

export async function listWatchlists(email: string): Promise<Watchlist[]> {
  return withDb(
    async (db) => {
      const rows = await db
        .select()
        .from(t.userWatchlists)
        .where(eq(t.userWatchlists.email, email));
      return rows.map(watchlistFromRow);
    },
    () => mem().watchlists.filter((w) => w.email === email),
  );
}

/** Every armed rule across all users — used by the cron sweep. */
export async function listAllWatchlists(): Promise<Watchlist[]> {
  return withDb(
    async (db) => {
      const rows = await db.select().from(t.userWatchlists);
      return rows.map(watchlistFromRow);
    },
    () => [...mem().watchlists],
  );
}

async function touchWatchlistTriggered(id: string, iso: string): Promise<void> {
  mem().watchlists = mem().watchlists.map((x) =>
    x.id === id ? { ...x, lastTriggeredAt: iso } : x,
  );
  await withDb(
    async (db) => {
      await db
        .update(t.userWatchlists)
        .set({ lastTriggeredAt: new Date(iso) })
        .where(eq(t.userWatchlists.id, id));
    },
    () => undefined,
  );
}

export async function createWatchlist(
  input: WatchlistInput,
): Promise<Watchlist> {
  const w: Watchlist = {
    id: randomUUID(),
    email: input.email,
    label: input.label,
    provider: input.provider,
    service: input.service,
    minMonthlyWasteUsd: input.minMonthlyWasteUsd,
    channel: input.channel,
    enabled: true,
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
  };
  await withDb(
    async (db) => {
      await db.insert(t.userWatchlists).values({
        id: w.id,
        email: w.email,
        label: w.label,
        provider: w.provider,
        service: w.service,
        minMonthlyWasteUsd: w.minMonthlyWasteUsd,
        channel: w.channel,
        enabled: w.enabled,
        lastTriggeredAt: null,
      });
      return w;
    },
    () => {
      mem().watchlists.push(w);
      return w;
    },
  );
  return w;
}

export async function setWatchlistEnabled(
  id: string,
  email: string,
  enabled: boolean,
): Promise<boolean> {
  return withDb(
    async (db) => {
      await db
        .update(t.userWatchlists)
        .set({ enabled })
        .where(eq(t.userWatchlists.id, id));
      return true;
    },
    () => {
      const m = mem();
      const w = m.watchlists.find((x) => x.id === id && x.email === email);
      if (w) w.enabled = enabled;
      return Boolean(w);
    },
  );
}

export async function deleteWatchlist(
  id: string,
  email: string,
): Promise<boolean> {
  return withDb(
    async (db) => {
      await db
        .delete(t.userWatchlists)
        .where(eq(t.userWatchlists.id, id));
      return true;
    },
    () => {
      const m = mem();
      const before = m.watchlists.length;
      m.watchlists = m.watchlists.filter(
        (x) => !(x.id === id && x.email === email),
      );
      return m.watchlists.length < before;
    },
  );
}

// ─── Alert events ───────────────────────────────────────────────────────

export async function recordAlert(
  evt: Omit<AlertEvent, "id" | "createdAt">,
): Promise<void> {
  const full: AlertEvent = {
    ...evt,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const m = mem();
  m.alerts.unshift(full);
  if (m.alerts.length > 200) m.alerts.length = 200;
  await withDb(
    async (db) => {
      await db.insert(t.alertEvents).values({
        id: full.id,
        watchlistId: full.watchlistId,
        leakId: full.leakId,
        channel: full.channel,
        status: full.status,
        latencyMs: full.latencyMs,
        message: full.message,
      });
    },
    () => undefined,
  );
}

export async function listAlertEvents(
  email: string | null,
  limit = 25,
): Promise<AlertEvent[]> {
  const mine = email ? await listWatchlists(email) : [];
  const ids = new Set(mine.map((w) => w.id));
  return withDb(
    async (db) => {
      const rows = await db.select().from(t.alertEvents);
      return rows
        .filter((r) => (email ? ids.has(r.watchlistId ?? "") : true))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit)
        .map((r) => ({
          id: r.id,
          watchlistId: r.watchlistId,
          leakId: r.leakId,
          channel: r.channel as AlertEvent["channel"],
          status: r.status as AlertEvent["status"],
          latencyMs: r.latencyMs,
          message: r.message,
          createdAt: r.createdAt.toISOString(),
        }));
    },
    () =>
      mem()
        .alerts.filter((a) =>
          email ? ids.has(a.watchlistId ?? "") : true,
        )
        .slice(0, limit),
  );
}

// ─── Newsletter ─────────────────────────────────────────────────────────

export async function subscribeNewsletter(
  email: string,
  source: string,
): Promise<{ ok: boolean; already: boolean }> {
  const key = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
    return { ok: false, already: false };
  }
  const existing = await withDb(
    async (db) => {
      const rows = await db
        .select()
        .from(t.newsletterSubscribers)
        .where(eq(t.newsletterSubscribers.email, key))
        .limit(1);
      return rows.length > 0;
    },
    () => mem().subscribers.has(key),
  );
  if (existing) return { ok: true, already: true };
  await withDb(
    async (db) => {
      await db
        .insert(t.newsletterSubscribers)
        .values({ email: key, source })
        .onConflictDoNothing();
      return true;
    },
    () => {
      mem().subscribers.set(key, {
        email: key,
        source,
        createdAt: new Date().toISOString(),
      });
      return true;
    },
  );
  return { ok: true, already: false };
}

// ─── Subscriptions + profiles ───────────────────────────────────────────

export async function getActiveSubscription(
  email: string,
): Promise<Subscription | null> {
  const key = email.trim().toLowerCase();
  return withDb(
    async (db) => {
      const rows = await db
        .select()
        .from(t.subscriptions)
        .where(eq(t.subscriptions.email, key))
        .limit(1);
      const r = rows[0];
      if (!r || r.status !== "active") return null;
      return {
        email: r.email,
        provider: r.provider as Subscription["provider"],
        externalId: r.externalId,
        plan: r.plan,
        status: r.status as Subscription["status"],
        amountMinor: r.amountMinor,
        currency: r.currency as Subscription["currency"],
        currentPeriodEnd: r.currentPeriodEnd
          ? r.currentPeriodEnd.toISOString()
          : null,
        createdAt:
          r.createdAt instanceof Date
            ? r.createdAt.toISOString()
            : String(r.createdAt),
      };
    },
    () => {
      const s = mem().subscriptions.get(key);
      return s && s.status === "active" ? s : null;
    },
  );
}

export async function upsertSubscription(sub: Subscription): Promise<void> {
  const key = sub.email.trim().toLowerCase();
  const normalized = { ...sub, email: key };
  mem().subscriptions.set(key, normalized);
  await withDb(
    async (db) => {
      await db
        .insert(t.subscriptions)
        .values({
          email: key,
          provider: normalized.provider,
          externalId: normalized.externalId,
          plan: normalized.plan,
          status: normalized.status,
          amountMinor: normalized.amountMinor,
          currency: normalized.currency,
          currentPeriodEnd: normalized.currentPeriodEnd
            ? new Date(normalized.currentPeriodEnd)
            : null,
        })
        .onConflictDoUpdate({
          target: t.subscriptions.email,
          set: {
            provider: normalized.provider,
            externalId: normalized.externalId,
            plan: normalized.plan,
            status: normalized.status,
            amountMinor: normalized.amountMinor,
            currency: normalized.currency,
            currentPeriodEnd: normalized.currentPeriodEnd
              ? new Date(normalized.currentPeriodEnd)
              : null,
          },
        });
    },
    () => undefined,
  );
}

export async function upsertProfile(
  email: string,
  opts: { vip?: boolean; login?: boolean } = {},
): Promise<void> {
  const key = email.trim().toLowerCase();
  const m = mem();
  const existing = m.profiles.get(key);
  m.profiles.set(key, {
    email: key,
    vip: opts.vip ?? existing?.vip ?? false,
    lastLoginAt: new Date().toISOString(),
  });
  await withDb(
    async (db) => {
      await db
        .insert(t.profiles)
        .values({
          email: key,
          vip: opts.vip ?? false,
          lastLoginAt: new Date(),
        })
        .onConflictDoUpdate({
          target: t.profiles.email,
          set: {
            lastLoginAt: new Date(),
            ...(opts.vip !== undefined ? { vip: opts.vip } : {}),
          },
        });
    },
    () => undefined,
  );
}

// ─── Remediation history ────────────────────────────────────────────────

export async function recordRemediation(
  leakId: string,
  email: string | null,
  scriptType: "terraform" | "cli",
): Promise<void> {
  const rec: RemediationRecord = {
    id: randomUUID(),
    leakId,
    email,
    scriptType,
    createdAt: new Date().toISOString(),
  };
  mem().remediations.push(rec);
  await withDb(
    async (db) => {
      await db.insert(t.remediationHistory).values({
        id: rec.id,
        leakId,
        email,
        scriptType,
      });
    },
    () => undefined,
  );
}

export async function countRemediations(leakId: string): Promise<number> {
  return withDb(
    async (db) => {
      const rows = await db
        .select()
        .from(t.remediationHistory)
        .where(eq(t.remediationHistory.leakId, leakId));
      return rows.length;
    },
    () => mem().remediations.filter((r) => r.leakId === leakId).length,
  );
}

// ─── System state + magic link tokens ───────────────────────────────────

export async function getState(key: string): Promise<string | null> {
  return withDb(
    async (db) => {
      const rows = await db
        .select()
        .from(t.systemState)
        .where(eq(t.systemState.key, key))
        .limit(1);
      return rows[0]?.value ?? null;
    },
    () => mem().state.get(key) ?? null,
  );
}

export async function setState(key: string, value: string): Promise<void> {
  mem().state.set(key, value);
  await withDb(
    async (db) => {
      await db
        .insert(t.systemState)
        .values({ key, value })
        .onConflictDoUpdate({
          target: t.systemState.key,
          set: { value, updatedAt: new Date() },
        });
    },
    () => undefined,
  );
}

export async function createMagicToken(email: string): Promise<string> {
  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 8);
  const exp = Date.now() + 15 * 60_000;
  mem().magicTokens.set(token, { email: email.toLowerCase(), exp, used: false });
  await setState(
    `magic:${token}`,
    JSON.stringify({ email: email.toLowerCase(), exp, used: false }),
  );
  return token;
}

export async function consumeMagicToken(
  token: string,
): Promise<string | null> {
  const m = mem();
  const local = m.magicTokens.get(token);
  if (local) {
    if (local.used || Date.now() > local.exp) return null;
    local.used = true;
    return local.email;
  }
  const raw = await getState(`magic:${token}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      email: string;
      exp: number;
      used: boolean;
    };
    if (data.used || Date.now() > data.exp) return null;
    data.used = true;
    await setState(`magic:${token}`, JSON.stringify(data));
    return data.email;
  } catch {
    return null;
  }
}

// ─── Scan cycle (cron) ──────────────────────────────────────────────────

export interface ScanSummary {
  scanned: number;
  triggered: number;
  delivered: number;
  results: ChannelResult[];
  broadcast: BroadcastSummary[];
}

export async function runScanCycle(): Promise<ScanSummary> {
  const m = mem();

  // Simulate a fresh infrastructure scan: jitter waste within ±5%.
  m.leaks = m.leaks.map((l) => ({
    ...l,
    monthlyWasteUsd: Math.max(
      500,
      Math.round(l.monthlyWasteUsd * (0.95 + Math.random() * 0.1)),
    ),
  }));
  const now = new Date().toISOString();
  m.lastScanAt = now;
  await setState("last_scan_at", now);

  let triggered = 0;
  let delivered = 0;
  const results: ChannelResult[] = [];
  const broadcast: BroadcastSummary[] = [];

  const armed = await listAllWatchlists();
  for (const w of armed) {
    if (!w.enabled) continue;
    if (
      w.lastTriggeredAt &&
      Date.now() - Date.parse(w.lastTriggeredAt) < 30 * 60_000
    ) {
      continue;
    }
    const matches = m.leaks
      .filter(
        (l) =>
          (w.provider === "any" || l.provider === w.provider) &&
          (w.service === "any" || l.service === w.service) &&
          l.monthlyWasteUsd >= w.minMonthlyWasteUsd,
      )
      .sort((a, b) => b.monthlyWasteUsd - a.monthlyWasteUsd);
    if (matches.length === 0) continue;

    const top = matches[0];
    const msg = `🚨 CloudTrim tripwire "${w.label}": ${matches.length} leak(s) ≥ ${usdRound(
      w.minMonthlyWasteUsd,
    )}/mo — worst offender ${top.resourceName} at ${usdRound(
      top.monthlyWasteUsd,
    )}/mo (WasteScore ${top.wasteScore})`;

    const summary = await broadcastAlert(msg, w.email);
    broadcast.push(summary);
    triggered += 1;
    delivered += summary.delivered;
    results.push(...summary.results);
    await touchWatchlistTriggered(w.id, now);

    const maxLatency = summary.results.reduce(
      (acc, r) => Math.max(acc, r.latencyMs),
      0,
    );
    await recordAlert({
      watchlistId: w.id,
      leakId: top.id,
      channel: summary.attempted > 0 ? "all" : w.channel,
      status:
        summary.delivered > 0
          ? "delivered"
          : summary.attempted > 0
            ? "failed"
            : "skipped",
      latencyMs: maxLatency,
      message: msg,
    });
  }

  return {
    scanned: m.leaks.length,
    triggered,
    delivered,
    results,
    broadcast,
  };
}
