import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "../src/pricing/calculate-order-total";
import { allAmountsAreIntegers, orderWithSubtotal } from "./support";

const CAP = 50_000; // £500 in minor units

describe("Task 2 - wholesale discount cap", () => {
  it("does not cap retail discounts", () => {
    const total = calculateOrderTotal(
      orderWithSubtotal(600_000, { customerTier: "retail", discountPercent: 10 }),
    );
    expect(total.discount).toBe(60_000);
  });

  it("leaves a wholesale discount below the cap untouched", () => {
    const total = calculateOrderTotal(
      orderWithSubtotal(400_000, { customerTier: "wholesale", discountPercent: 10 }),
    );
    expect(total.discount).toBe(40_000);
  });

  it("allows a wholesale discount exactly at the cap", () => {
    const total = calculateOrderTotal(
      orderWithSubtotal(500_000, { customerTier: "wholesale", discountPercent: 10 }),
    );
    expect(total.discount).toBe(CAP);
  });

  it("caps a wholesale discount above the cap", () => {
    const total = calculateOrderTotal(
      orderWithSubtotal(600_000, { customerTier: "wholesale", discountPercent: 10 }),
    );
    expect(total.discount).toBe(CAP);
  });

  it("keeps the pipeline consistent and integer-only when capping", () => {
    const total = calculateOrderTotal(
      orderWithSubtotal(633_337, { customerTier: "wholesale", discountPercent: 12.5 }),
    );
    expect(total.discount).toBe(CAP);
    expect(allAmountsAreIntegers(total)).toBe(true);
    expect(total.total).toBe(total.subtotal - total.discount + total.shipping + total.tax);
  });

  it("still applies no discount when no percentage is supplied", () => {
    const total = calculateOrderTotal(orderWithSubtotal(900_000, { customerTier: "wholesale" }));
    expect(total.discount).toBe(0);
  });
});
