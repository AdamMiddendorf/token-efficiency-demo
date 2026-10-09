/**
 * Money is always an integer number of minor units (pence, cents).
 * See docs/decisions/001-money-as-minor-units.md.
 */
export type Money = number;

export function assertMinorUnits(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label} must be an integer number of minor units, received ${value}`);
  }
}

/** Percentage of an amount, rounded to the nearest minor unit. */
export function percentOf(amount: Money, percent: number): Money {
  assertMinorUnits(amount, "amount");
  return Math.round((amount * percent) / 100);
}

/** Sum of a set of amounts, in minor units. */
export function sumMinorUnits(values: readonly Money[]): Money {
  return values.reduce((total, value) => total + value, 0);
}
