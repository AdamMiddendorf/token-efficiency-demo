import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "../../src/pricing/calculate-order-total";
import type { Order } from "../../src/orders/order";

function order(overrides: Partial<Order> = {}): Order {
  return {
    customerTier: "retail",
    lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 10_000 }],
    shippingMethod: "standard",
    countryCode: "GB",
    ...overrides,
  };
}

describe("calculateOrderTotal", () => {
  it("prices an order without a discount", () => {
    const small = order({ lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 5_000 }] });
    expect(calculateOrderTotal(small)).toEqual({
      subtotal: 5_000,
      discount: 0,
      shipping: 500,
      tax: 1_100,
      total: 6_600,
    });
  });

  it("charges tax on the discounted merchandise subtotal plus shipping", () => {
    // £100 merchandise, 10% discount, £5 standard shipping, 20% UK tax.
    // taxable = £90 + £5 = £95 -> tax £19 -> total £114.
    expect(calculateOrderTotal(order({ discountPercent: 10 }))).toEqual({
      subtotal: 10_000,
      discount: 1_000,
      shipping: 500,
      tax: 1_900,
      total: 11_400,
    });
  });

  it("prices express shipping", () => {
    const total = calculateOrderTotal(order({ shippingMethod: "express" }));
    expect(total.shipping).toBe(1_500);
    expect(total.total).toBe(13_800);
  });

  it("keeps every amount in integer minor units", () => {
    const total = calculateOrderTotal(
      order({ lines: [{ sku: "BOX-B", quantity: 3, unitPrice: 3_333 }] }),
    );
    for (const amount of Object.values(total)) {
      expect(Number.isInteger(amount)).toBe(true);
    }
  });
});
