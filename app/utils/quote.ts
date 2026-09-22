export interface PlanQuote {
  months: number;
  monthly: number;
  payToday: number;
  totalRepayable: number;
  costOfCredit: number;
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

export function getPlanQuote(subtotal: number): PlanQuote[] {
  const payToday = roundToNearest(subtotal * 0.322, 100);
  const financed = subtotal - payToday;
  const terms = [6, 9, 12];

  return terms.map((months) => {
    const rate = 0.115 * (months / 6);
    const rawTotal = subtotal + financed * rate;
    const monthly = roundToNearest((rawTotal - payToday) / months, 100);
    const totalRepayable = payToday + monthly * months;
    const costOfCredit = totalRepayable - subtotal;
    return { months, monthly, payToday, totalRepayable, costOfCredit };
  });
}
