const CAP = 64;
const cache = new Map<string, string>();

export function thumbKey(frame: { sku?: string; color?: string }, color?: string): string {
  return `${frame.sku ?? "?"}:${color ?? frame.color ?? ""}`;
}

export function cacheGet(key: string): string | null {
  const hit = cache.get(key);
  if (hit === undefined) {
    return null;
  }
  // Re-insert so the most recently read entry is the last to be evicted.
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

export function cacheSet(key: string, dataUrl: string): void {
  cache.set(key, dataUrl);
  while (cache.size > CAP) {
    const oldest = cache.keys().next().value as string;
    cache.delete(oldest);
  }
}

export function cacheSize(): number {
  return cache.size;
}
