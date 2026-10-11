/**
 * Resilient Postgres connection.
 *
 * Guarantees:
 *  - The app boots and renders with ZERO live database: when DATABASE_URL is
 *    missing or the probe fails, getDb() returns null and callers fall back
 *    to the in-memory catalog via withDb().
 *  - Negative caching prevents probe storms against a dead database.
 *  - No connection is attempted at module import time.
 */

import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const PROBE_TIMEOUT_MS = 2_500;
const QUERY_TIMEOUT_MS = 4_000;
const NEGATIVE_TTL_MS = 20_000;

interface DbState {
  pool?: Pool;
  db?: Db;
  status: "unknown" | "connected" | "offline";
  lastFailure: number;
}

const g = globalThis as typeof globalThis & { __ctDb?: DbState };

function state(): DbState {
  if (!g.__ctDb) g.__ctDb = { status: "unknown", lastFailure: 0 };
  return g.__ctDb;
}

function client(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const s = state();
  if (!s.db) {
    s.pool = new Pool({
      connectionString: url,
      max: 2,
      connectionTimeoutMillis: PROBE_TIMEOUT_MS,
      idleTimeoutMillis: 10_000,
    });
    // Never let background socket errors crash the process.
    s.pool.on("error", () => {});
    s.db = drizzle(s.pool, { schema });
  }
  return s.db;
}

function delay(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );
}

/** Returns a live Drizzle client, or null when Postgres is unavailable. */
export async function getDb(): Promise<Db | null> {
  const s = state();
  if (!process.env.DATABASE_URL) {
    s.status = "offline";
    return null;
  }
  if (s.status === "connected") return s.db ?? client();
  if (s.status === "offline" && Date.now() - s.lastFailure < NEGATIVE_TTL_MS) {
    return null;
  }
  const db = client();
  if (!db) return null;
  try {
    await Promise.race([db.execute(sql`SELECT 1`), delay(PROBE_TIMEOUT_MS)]);
    s.status = "connected";
    return db;
  } catch {
    s.status = "offline";
    s.lastFailure = Date.now();
    return null;
  }
}

/** Current connectivity, without throwing. */
export async function dbStatus(): Promise<"connected" | "offline"> {
  const db = await getDb();
  return db ? "connected" : "offline";
}

/**
 * Run `fn` against Postgres; transparently degrade to `fallback` when the
 * database is missing, offline, or too slow.
 */
export async function withDb<T>(
  fn: (db: Db) => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  const db = await getDb();
  const s = state();
  if (!db) return fallback();
  try {
    return await Promise.race<T>([fn(db), delay(QUERY_TIMEOUT_MS)]);
  } catch {
    s.status = "offline";
    s.lastFailure = Date.now();
    return fallback();
  }
}
