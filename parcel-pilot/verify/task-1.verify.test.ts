import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "../src/pricing/calculate-order-total";
import { toOrderResponse } from "../src/api/order-response";
import { taxRatePercentFor } from "../src/pricing/tax-calculator";
import { allAmountsAreIntegers, orderOf, orderWithSubtotal } from "./support";

describe("Task 1 - discounted orders are taxed correctly", () => {
  it("taxes the discounted merchandise subtotal plus shipping", () => {
    expect(calculateOrderTotal(orderOf({ discountPercent: 10 }))).toEqual({
      subtotal: 10_000,
      discount: 1_000,
      shipping: 500,
      tax: 1_900,
      total: 11_400,
    });
  });

  it("leaves undiscounted orders unchanged", () => {
    expect(calculateOrderTotal(orderWithSubtotal(5_000))).toEqual({
      subtotal: 5_000,
      discount: 0,
      shipping: 500,
      tax: 1_100,
      total: 6_600,
    });
  });

  it("keeps the total internally consistent for a range of discounts", () => {
    for (const discountPercent of [0, 5, 12.5, 33, 100]) {
      const total = calculateOrderTotal(orderOf({ discountPercent }));
      expect(allAmountsAreIntegers(total)).toBe(true);
      expect(total.total).toBe(total.subtotal - total.discount + total.shipping + total.tax);
    }
  });

  it("does not change the tax-rate implementation", () => {
    expect(taxRatePercentFor("GB")).toBe(20);
    expect(taxRatePercentFor("DE")).toBe(19);
    expect(taxRatePercentFor("US")).toBe(0);
  });

  it("keeps the public API response shape backward-compatible", () => {
    const response = toOrderResponse({
      id: "ord_1",
      customerId: "cus_1",
      order: orderOf({ discountPercent: 10 }),
      total: calculateOrderTotal(orderOf({ discountPercent: 10 })),
      status: "placed",
      placedAt: "2026-01-05T09:00:00.000Z",
    });

    expect(Object.keys(response).sort()).toEqual(["id", "placedAt", "status", "totals"]);
    expect(Object.keys(response.totals).sort()).toEqual([
      "currency",
      "discount",
      "shipping",
      "subtotal",
      "tax",
      "total",
    ]);
  });
});
