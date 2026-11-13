/** An API timestamp or YYYY-MM-DD date as "9 Nov 2026", in Lagos time. */
export function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
}
