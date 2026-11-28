// One place for money formatting so the currency symbol is consistent
// everywhere. Prices are in somoni ("c").

// Prices are whole integers. Group thousands; no decimals.
export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("ru")}c`;
}
