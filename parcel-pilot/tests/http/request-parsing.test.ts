import { describe, expect, it } from "vitest";
import { parseCreateOrderRequest } from "../../src/http/request-parsing";

const valid = {
  customerId: "cus_1",
  customerTier: "retail",
  lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 5_000 }],
  shippingMethod: "standard",
  countryCode: "GB",
};

describe("parseCreateOrderRequest", () => {
  it("parses a well-formed body", () => {
    const result = parseCreateOrderRequest(valid);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.customerId).toBe("cus_1");
    expect(result.value.order.lines).toHaveLength(1);
  });

  it("drops properties the domain does not know about", () => {
    const result = parseCreateOrderRequest({ ...valid, internalOverride: true, total: 1 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.order).not.toHaveProperty("internalOverride");
    expect(result.value.order).not.toHaveProperty("total");
  });

  it("omits optional fields rather than setting them to undefined", () => {
    const result = parseCreateOrderRequest(valid);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.value.order).sort()).toEqual([
      "countryCode",
      "customerTier",
      "lines",
      "shippingMethod",
    ]);
  });

  it("keeps a promotion code when one is supplied", () => {
    const result = parseCreateOrderRequest({ ...valid, promoCode: "WELCOME10" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.order.promoCode).toBe("WELCOME10");
  });

  it.each([
    ["a non-object body", "nope"],
    ["a missing customerId", { ...valid, customerId: undefined }],
    ["an unknown tier", { ...valid, customerTier: "platinum" }],
    ["an unknown shipping method", { ...valid, shippingMethod: "drone" }],
    ["lines that are not an array", { ...valid, lines: {} }],
    ["a line with a non-numeric quantity", { ...valid, lines: [{ sku: "A", quantity: "2", unitPrice: 1 }] }],
  ])("rejects %s", (_label, body) => {
    expect(parseCreateOrderRequest(body).ok).toBe(false);
  });
});
