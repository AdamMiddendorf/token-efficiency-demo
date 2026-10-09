import { describe, expect, it } from "vitest";
import { MAX_CAMPAIGN_PERCENT, PromotionEngine } from "../../src/promotions/promotion-engine";
import { fixedClock } from "../../src/shared/clock";

const engine = new PromotionEngine(fixedClock("2026-03-01T00:00:00.000Z"));

describe("PromotionEngine", () => {
  it("resolves an eligible code to its percentage", () => {
    const outcome = engine.resolve({ code: "welcome10", customerTier: "retail", subtotal: 10_000 });

    expect(outcome).toEqual({
      applied: true,
      promotion: expect.objectContaining({ code: "WELCOME10" }),
      percentOff: 10,
    });
  });

  it("rejects an unknown code", () => {
    const outcome = engine.resolve({ code: "NOPE", customerTier: "retail", subtotal: 10_000 });
    expect(outcome).toEqual({ applied: false, reason: "unknown-code" });
  });

  it("rejects a code the tier is not eligible for", () => {
    const outcome = engine.resolve({ code: "TRADE15", customerTier: "retail", subtotal: 90_000 });
    expect(outcome).toEqual({ applied: false, reason: "tier-not-eligible" });
  });

  it("rejects a code below its minimum subtotal", () => {
    const outcome = engine.resolve({ code: "TRADE15", customerTier: "wholesale", subtotal: 1_000 });
    expect(outcome).toEqual({ applied: false, reason: "below-minimum-subtotal" });
  });

  it("rejects an expired campaign", () => {
    const outcome = engine.resolve({ code: "SPRING24", customerTier: "retail", subtotal: 10_000 });
    expect(outcome).toEqual({ applied: false, reason: "inactive" });
  });

  it("rejects a campaign that has not started", () => {
    const earlier = new PromotionEngine(fixedClock("2025-02-01T00:00:00.000Z"));
    const outcome = earlier.resolve({ code: "BULK20", customerTier: "wholesale", subtotal: 900_000 });

    expect(outcome).toEqual({ applied: false, reason: "not-yet-started" });
  });

  it("never grants more than the campaign percentage guard", () => {
    const outcome = engine.resolve({ code: "BULK20", customerTier: "wholesale", subtotal: 900_000 });

    expect(outcome.applied).toBe(true);
    if (!outcome.applied) return;
    expect(outcome.percentOff).toBeLessThanOrEqual(MAX_CAMPAIGN_PERCENT);
  });
});
