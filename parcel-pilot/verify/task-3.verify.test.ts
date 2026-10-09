import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "../src/pricing/calculate-order-total";
import { allAmountsAreIntegers, orderWithSubtotal } from "./support";

describe("Task 3 - free standard shipping", () => {
  it("charges standard shipping below the threshold", () => {
    expect(calculateOrderTotal(orderWithSubtotal(9_999)).shipping).toBe(500);
  });

  it("makes standard shipping free exactly at the threshold", () => {
    expect(calculateOrderTotal(orderWithSubtotal(10_000)).shipping).toBe(0);
  });

  it("makes standard shipping free above the threshold", () => {
    expect(calculateOrderTotal(orderWithSubtotal(15_000)).shipping).toBe(0);
  });

  it("evaluates the threshold after the discount, not before", () => {
    // £120 merchandise with a 20% discount is £96 discounted: shipping is charged.
    const total = calculateOrderTotal(orderWithSubtotal(12_000, { discountPercent: 20 }));
    expect(total.discount).toBe(2_400);
    expect(total.shipping).toBe(500);
  });

  it("never makes express shipping free", () => {
    expect(
      calculateOrderTotal(orderWithSubtotal(15_000, { shippingMethod: "express" })).shipping,
    ).toBe(1_500);
    expect(
      calculateOrderTotal(orderWithSubtotal(500_000, { shippingMethod: "express" })).shipping,
    ).toBe(1_500);
  });

  it("taxes free shipping as zero and keeps the total consistent", () => {
    const total = calculateOrderTotal(orderWithSubtotal(20_000));
    expect(total.tax).toBe(4_000);
    expect(total.total).toBe(24_000);
    expect(allAmountsAreIntegers(total)).toBe(true);
  });
});
