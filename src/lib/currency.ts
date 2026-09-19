export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  TND: 3.10, // Tunisian Dinar
  QAR: 3.64, // Qatari Riyal
  EUR: 0.92, // Euro
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  TND: "د.ت",
  QAR: "ر.ق",
  EUR: "€",
};

export function formatMoney(amount: number, currency = "USD", locale = "ar-TN"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formattedNumber = Number(amount || 0).toLocaleString(locale === "ar" ? "ar-TN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formattedNumber} ${symbol}`;
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length <= 4) return acc || "••••";
  const last4 = acc.slice(-4);
  return `•••• •••• ${last4}`;
}

export function maskIBAN(iban: string): string {
  if (!iban || iban.length <= 8) return iban || "••••";
  const prefix = iban.slice(0, 4);
  const suffix = iban.slice(-4);
  return `${prefix} •••• •••• ${suffix}`;
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rateFrom = EXCHANGE_RATES[from] || 1.0;
  const rateTo = EXCHANGE_RATES[to] || 1.0;
  // Convert to USD first, then to target
  const inUsd = amount / rateFrom;
  return inUsd * rateTo;
}
