export function formatNaira(amount: number): string {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

/** An API amount in kobo, shown to the kobo unless it's whole naira. Never rounds. */
export function formatKobo(kobo: number): string {
  const fraction = kobo % 100 ? 2 : 0;
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: fraction, maximumFractionDigits: fraction });
}
