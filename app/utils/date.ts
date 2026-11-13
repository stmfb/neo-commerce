/** An API timestamp or YYYY-MM-DD date as "9 Nov 2026", in Lagos time. */
export function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
}

/** How long ago an API timestamp was: "Just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export function formatTimeAgo(value: string, now = Date.now()) {
  const minutes = Math.floor((now - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatOrderDate(value);
}
