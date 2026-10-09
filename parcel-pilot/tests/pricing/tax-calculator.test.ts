import { describe, expect, it } from "vitest";
import {
  DEFAULT_TAX_RATE_PERCENT,
  calculateTax,
  taxRatePercentFor,
} from "../../src/pricing/tax-calculator";

describe("tax-calculator", () => {
  it("looks up known country rates", () => {
    expect(taxRatePercentFor("GB")).toBe(20);
    expect(taxRatePercentFor("de")).toBe(19);
    expect(taxRatePercentFor("US")).toBe(0);
  });

  it("falls back to the default rate for unknown countries", () => {
    expect(taxRatePercentFor("ZZ")).toBe(DEFAULT_TAX_RATE_PERCENT);
  });

  it("rounds tax to the nearest minor unit", () => {
    expect(calculateTax(9_999, "GB")).toBe(2_000);
    expect(calculateTax(1_017, "NZ")).toBe(153);
  });
});
