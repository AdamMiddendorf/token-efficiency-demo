import { describe, expect, it } from "vitest";
import { currencyInfo, formatMoney } from "../../src/pricing/currency";

describe("currencyInfo", () => {
  it("knows the minor-unit scale of each supported currency", () => {
    expect(currencyInfo("GBP").minorUnitDigits).toBe(2);
    expect(currencyInfo("JPY").minorUnitDigits).toBe(0);
  });

  it("falls back to the default currency", () => {
    expect(currencyInfo("ZZZ").code).toBe("GBP");
  });
});

describe("formatMoney", () => {
  it("formats minor units as a decimal amount", () => {
    expect(formatMoney(11_400)).toBe("£114.00");
    expect(formatMoney(5)).toBe("£0.05");
  });

  it("respects currencies without minor units", () => {
    expect(formatMoney(1_250, "JPY")).toBe("¥1250");
  });

  it("places the sign before the symbol", () => {
    expect(formatMoney(-1_000)).toBe("-£10.00");
  });
});
