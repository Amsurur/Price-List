// One place for money formatting so the currency symbol is consistent everywhere.
// The shop may set Somoni; default is $.

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "$";

// Prices are whole integers. Group thousands; no decimals.
export function formatMoney(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString("en-US")}`;
}
