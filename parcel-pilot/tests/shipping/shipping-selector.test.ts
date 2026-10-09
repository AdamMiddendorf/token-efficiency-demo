import { describe, expect, it } from "vitest";
import { selectShippingMethod } from "../../src/shipping/shipping-selector";

describe("selectShippingMethod", () => {
  it("keeps express where express is available", () => {
    expect(selectShippingMethod({ requestedMethod: "express", countryCode: "GB" })).toBe(
      "express",
    );
  });

  it("downgrades express to standard outside the express zones", () => {
    expect(selectShippingMethod({ requestedMethod: "express", countryCode: "AU" })).toBe(
      "standard",
    );
  });

  it("leaves standard unchanged", () => {
    expect(selectShippingMethod({ requestedMethod: "standard", countryCode: "US" })).toBe(
      "standard",
    );
  });
});
