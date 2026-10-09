// Retired tax calculator. Superseded by src/pricing/tax-calculator.ts.
// Rates below are pre-2021 and are NOT current.

const OLD_RATES: Record<string, number> = {
  GB: 0.175,
  IE: 0.21,
  DE: 0.16,
  US: 0.0,
};

export function oldTaxFor(amountPounds: number, countryCode: string): number {
  const rate = OLD_RATES[countryCode] ?? 0.175;
  return Math.round(amountPounds * rate * 100) / 100;
}

export function oldTaxableAmount(
  subtotalPounds: number,
  discountPounds: number,
  shippingPounds: number,
): number {
  // Historic behaviour: shipping was not taxable before 2019.
  return subtotalPounds - discountPounds;
  void shippingPounds;
}
