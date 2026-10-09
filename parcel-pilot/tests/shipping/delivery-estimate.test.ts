import { describe, expect, it } from "vitest";
import { cheapestCarrier } from "../../src/shipping/carrier-rates";
import { estimateDelivery } from "../../src/shipping/delivery-estimate";
import { fixedClock } from "../../src/shared/clock";

// 2026-01-05 is a Monday.
const monday = fixedClock("2026-01-05T09:00:00.000Z");

describe("estimateDelivery", () => {
  it("estimates domestic standard delivery in working days", () => {
    expect(estimateDelivery("GB", "standard", monday)).toEqual({
      zone: "domestic",
      method: "standard",
      workingDays: 3,
      estimatedDeliveryDate: "2026-01-08",
    });
  });

  it("skips weekends", () => {
    // Thursday + 3 working days lands on the following Tuesday.
    const thursday = fixedClock("2026-01-08T09:00:00.000Z");
    expect(estimateDelivery("GB", "standard", thursday).estimatedDeliveryDate).toBe("2026-01-13");
  });

  it("is slower outside the domestic zone", () => {
    expect(estimateDelivery("DE", "standard", monday).workingDays).toBe(5);
    expect(estimateDelivery("AU", "standard", monday).workingDays).toBe(10);
  });
});

describe("cheapestCarrier", () => {
  it("picks the cheapest carrier whose weight band fits", () => {
    expect(cheapestCarrier("domestic", "standard", 500)?.costMinorUnits).toBe(289);
    expect(cheapestCarrier("domestic", "standard", 9_000)?.costMinorUnits).toBe(640);
  });

  it("returns nothing when no band fits", () => {
    expect(cheapestCarrier("domestic", "standard", 50_000)).toBeUndefined();
  });
});
