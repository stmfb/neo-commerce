/** Shortest query worth asking the API for suggestions. */
export const SUGGEST_MIN_CHARS = 2;
export const SUGGEST_MAX_CHARS = 100;

/**
 * One spelling per query, so "  iPhone 13" and "iphone 13" share a cache entry.
 * Upstream search is case-insensitive, so lowercasing doesn't change results.
 */
export function normaliseSearchTerm(q: string) {
  return q.trim().replace(/\s+/g, " ").toLowerCase().slice(0, SUGGEST_MAX_CHARS);
}
