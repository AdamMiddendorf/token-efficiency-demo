import { type Money, percentOf } from "./money";

const TAX_RATE_PERCENT_BY_COUNTRY: Record<string, number> = {
  GB: 20,
  IE: 23,
  DE: 19,
  FR: 20,
  NL: 21,
  US: 0,
  AU: 10,
  NZ: 15,
};

export const DEFAULT_TAX_RATE_PERCENT = 20;

export function taxRatePercentFor(countryCode: string): number {
  return TAX_RATE_PERCENT_BY_COUNTRY[countryCode.toUpperCase()] ?? DEFAULT_TAX_RATE_PERCENT;
}

/**
 * Tax on an already-computed taxable amount. Deciding *what* is taxable is the
 * responsibility of the pricing pipeline, not of this module.
 */
export function calculateTax(taxableAmount: Money, countryCode: string): Money {
  return percentOf(taxableAmount, taxRatePercentFor(countryCode));
}
