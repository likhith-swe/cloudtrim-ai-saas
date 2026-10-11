/** Sliding-window in-memory rate limiter for API endpoints. */

type Bucket = { hits: number[] };

const g = globalThis as typeof globalThis & {
  __ctRl?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  if (!g.__ctRl) g.__ctRl = new Map();
  return g.__ctRl;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const map = buckets();
  let b = map.get(key);
  if (!b) {
    b = { hits: [] };
    map.set(key, b);
  }
  b.hits = b.hits.filter((t) => now - t < windowMs);
  const ok = b.hits.length < limit;
  if (ok) b.hits.push(now);

  // Opportunistic prune so long-lived servers don't leak keys.
  if (map.size > 4096) {
    for (const [k, v] of map) {
      if (v.hits.length === 0) map.delete(k);
    }
  }

  const oldest = b.hits[0] ?? now;
  return {
    ok,
    remaining: Math.max(0, limit - b.hits.length),
    retryAfterMs: ok ? 0 : Math.max(0, windowMs - (now - oldest)),
  };
}

export function clientIpFallback(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0] ?? "unknown";
  return req.headers.get("x-real-ip") ?? "local";
}
