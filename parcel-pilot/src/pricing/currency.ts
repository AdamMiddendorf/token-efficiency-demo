export interface CurrencyInfo {
  code: string;
  symbol: string;
  /** Number of decimal digits in the minor unit. GBP has 2 (pence). */
  minorUnitDigits: number;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  GBP: { code: "GBP", symbol: "£", minorUnitDigits: 2 },
  EUR: { code: "EUR", symbol: "€", minorUnitDigits: 2 },
  USD: { code: "USD", symbol: "$", minorUnitDigits: 2 },
  AUD: { code: "AUD", symbol: "$", minorUnitDigits: 2 },
  NZD: { code: "NZD", symbol: "$", minorUnitDigits: 2 },
  JPY: { code: "JPY", symbol: "¥", minorUnitDigits: 0 },
};

export const DEFAULT_CURRENCY = "GBP";

export function currencyInfo(code: string = DEFAULT_CURRENCY): CurrencyInfo {
  return CURRENCIES[code.toUpperCase()] ?? CURRENCIES[DEFAULT_CURRENCY];
}

/**
 * Formats an integer minor-unit amount for display. This is the only place
 * where money becomes a decimal number, and it happens at the edge.
 */
export function formatMoney(valueMinorUnits: number, code: string = DEFAULT_CURRENCY): string {
  const info = currencyInfo(code);
  const divisor = 10 ** info.minorUnitDigits;
  const sign = valueMinorUnits < 0 ? "-" : "";
  const absolute = Math.abs(valueMinorUnits);
  return `${sign}${info.symbol}${(absolute / divisor).toFixed(info.minorUnitDigits)}`;
}
