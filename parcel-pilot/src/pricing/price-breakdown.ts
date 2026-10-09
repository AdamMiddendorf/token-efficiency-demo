import type { OrderTotal } from "../orders/order";
import { DEFAULT_CURRENCY, formatMoney } from "./currency";

export interface BreakdownLine {
  label: string;
  /** Signed amount in minor units: discounts are negative. */
  amountMinorUnits: number;
  formatted: string;
}

/**
 * Turns a computed `OrderTotal` into the lines shown on a receipt.
 *
 * This is presentation only. It derives every line from the fields the pricing
 * pipeline already produced and never recalculates discount, shipping or tax —
 * there must be exactly one implementation of the operation order, and it
 * lives in `calculate-order-total.ts`.
 */
export function priceBreakdown(
  total: OrderTotal,
  currency: string = DEFAULT_CURRENCY,
): BreakdownLine[] {
  const line = (label: string, amountMinorUnits: number): BreakdownLine => ({
    label,
    amountMinorUnits,
    formatted: formatMoney(amountMinorUnits, currency),
  });

  const lines: BreakdownLine[] = [line("Merchandise", total.subtotal)];

  if (total.discount > 0) {
    lines.push(line("Discount", -total.discount));
  }

  lines.push(
    line("Shipping", total.shipping),
    line("Tax", total.tax),
    line("Total", total.total),
  );

  return lines;
}

/** The amount that tax was charged on, derived from a computed total. */
export function taxableAmountOf(total: OrderTotal): number {
  return total.subtotal - total.discount + total.shipping;
}
