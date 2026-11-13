/**
 * Small in-memory cache with an expiry per entry and a size cap. When full, the least
 * recently used entry is dropped, so memory stays bounded however many keys come through.
 */
export function createTtlCache<T>(options: { max: number; ttlMs: number }) {
  // A Map iterates in insertion order; re-inserting on read keeps the oldest entry first.
  const entries = new Map<string, { value: T; expires: number }>();

  return {
    get(key: string): T | undefined {
      const entry = entries.get(key);
      if (!entry) return undefined;
      entries.delete(key);
      if (entry.expires <= Date.now()) return undefined;
      entries.set(key, entry);
      return entry.value;
    },

    set(key: string, value: T) {
      entries.delete(key);
      entries.set(key, { value, expires: Date.now() + options.ttlMs });
      if (entries.size > options.max) entries.delete(entries.keys().next().value!);
    },
  };
}
