/** Tiny in-memory LRU cache plus a negative-cache gate for DB outages. */

interface Entry<V> {
  v: V;
  exp: number;
}

export class LruCache<V> {
  private map = new Map<string, Entry<V>>();

  constructor(private max: number = 128) {}

  get(key: string): V | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.exp > 0 && Date.now() > hit.exp) {
      this.map.delete(key);
      return undefined;
    }
    // refresh recency
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.v;
  }

  set(key: string, v: V, ttlMs = 0): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { v, exp: ttlMs > 0 ? Date.now() + ttlMs : 0 });
    while (this.map.size > this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

/**
 * Negative gate: once tripped, blocks expensive retries for ttlMs.
 * Used to keep Postgres probes from hammering a dead database.
 */
export class NegativeGate {
  private until = 0;

  constructor(private ttlMs: number = 20_000) {}

  get blocked(): boolean {
    return Date.now() < this.until;
  }

  trip(): void {
    this.until = Date.now() + this.ttlMs;
  }

  reset(): void {
    this.until = 0;
  }
}
