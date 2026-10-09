import { describe, expect, it } from "vitest";
import { applyDiscount } from "../../src/pricing/apply-discount";

describe("applyDiscount", () => {
  it("returns no discount when no percentage is supplied", () => {
    expect(applyDiscount({ subtotal: 50_000, customerTier: "retail" })).toBe(0);
  });

  it("applies a percentage discount for retail customers", () => {
    // £6,000 at 10% -> £600.
    expect(
      applyDiscount({ subtotal: 600_000, customerTier: "retail", discountPercent: 10 }),
    ).toBe(60_000);
  });

  it("applies a percentage discount for wholesale customers", () => {
    // £4,000 at 10% -> £400.
    expect(
      applyDiscount({ subtotal: 400_000, customerTier: "wholesale", discountPercent: 10 }),
    ).toBe(40_000);
  });

  it("rejects a percentage outside 0-100", () => {
    expect(() =>
      applyDiscount({ subtotal: 1_000, customerTier: "wholesale", discountPercent: 120 }),
    ).toThrow(/between 0 and 100/);
  });
});
