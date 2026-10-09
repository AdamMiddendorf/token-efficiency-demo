import { describe, expect, it } from "vitest";
import { priceBreakdown, taxableAmountOf } from "../../src/pricing/price-breakdown";
import type { OrderTotal } from "../../src/orders/order";

const withDiscount: OrderTotal = {
  subtotal: 10_000,
  discount: 1_000,
  shipping: 500,
  tax: 1_900,
  total: 11_400,
};

const withoutDiscount: OrderTotal = {
  subtotal: 5_000,
  discount: 0,
  shipping: 500,
  tax: 1_100,
  total: 6_600,
};

describe("priceBreakdown", () => {
  it("shows the discount as a negative line", () => {
    const lines = priceBreakdown(withDiscount);

    expect(lines.map((line) => line.label)).toEqual([
      "Merchandise",
      "Discount",
      "Shipping",
      "Tax",
      "Total",
    ]);
    expect(lines[1]).toEqual({
      label: "Discount",
      amountMinorUnits: -1_000,
      formatted: "-£10.00",
    });
  });

  it("omits the discount line when there is no discount", () => {
    expect(priceBreakdown(withoutDiscount).map((line) => line.label)).toEqual([
      "Merchandise",
      "Shipping",
      "Tax",
      "Total",
    ]);
  });

  it("formats in the requested currency", () => {
    expect(priceBreakdown(withoutDiscount, "EUR").at(-1)?.formatted).toBe("€66.00");
  });
});

describe("taxableAmountOf", () => {
  it("is the discounted merchandise subtotal plus shipping", () => {
    expect(taxableAmountOf(withDiscount)).toBe(9_500);
    expect(taxableAmountOf(withoutDiscount)).toBe(5_500);
  });
});
