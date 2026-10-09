// Parcel Pilot pricing, version 1 (retired 2024).
// Superseded by src/pricing/calculate-order-total.ts.
// Kept only because the 2024 finance audit referenced these figures.

export interface LegacyOrderLine {
  sku: string;
  quantity: number;
  unitPricePounds: number; // pounds and pence as a float - see ADR 001
}

export function legacySubtotal(lines: LegacyOrderLine[]): number {
  return lines.reduce((total, line) => total + line.unitPricePounds * line.quantity, 0);
}

export function legacyDiscount(subtotalPounds: number, discountPercent: number): number {
  return (subtotalPounds * discountPercent) / 100;
}

export function legacyTotal(
  lines: LegacyOrderLine[],
  discountPercent: number,
  shippingPounds: number,
  taxRate: number,
): number {
  const subtotal = legacySubtotal(lines);
  const discount = legacyDiscount(subtotal, discountPercent);
  const taxable = subtotal - discount + shippingPounds;
  return subtotal - discount + shippingPounds + taxable * taxRate;
}

export const LEGACY_DISCOUNT_CAP_POUNDS = 500;
export const LEGACY_FREE_SHIPPING_THRESHOLD_POUNDS = 75;
