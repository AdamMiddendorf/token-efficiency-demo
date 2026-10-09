import { describe, expect, it } from "vitest";
import { StaticProductCatalog } from "../../src/catalog/product-catalog";
import type { Order } from "../../src/orders/order";
import { validateOrder } from "../../src/orders/order-validation";

function order(overrides: Partial<Order> = {}): Order {
  return {
    customerTier: "retail",
    lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 5_000 }],
    shippingMethod: "standard",
    countryCode: "GB",
    ...overrides,
  };
}

describe("validateOrder", () => {
  it("accepts a well-formed order", () => {
    expect(validateOrder(order())).toEqual([]);
  });

  it("rejects an empty order", () => {
    expect(validateOrder(order({ lines: [] }))).toEqual([
      { field: "lines", message: "An order must contain at least one line" },
    ]);
  });

  it("reports every problem rather than only the first", () => {
    const issues = validateOrder(
      order({
        lines: [
          { sku: "BOX-A", quantity: 0, unitPrice: 5_000 },
          { sku: "BOX-B", quantity: 1, unitPrice: 12.5 },
        ],
        countryCode: "GBR",
      }),
    );

    expect(issues.map((issue) => issue.field)).toEqual([
      "lines[0].quantity",
      "lines[1].unitPrice",
      "countryCode",
    ]);
  });

  it("rejects a discount percentage outside 0-100", () => {
    expect(validateOrder(order({ discountPercent: 120 }))[0].field).toBe("discountPercent");
  });

  it("checks SKUs only when a catalog is supplied", () => {
    const unknown = order({ lines: [{ sku: "NOPE-1", quantity: 1, unitPrice: 100 }] });

    expect(validateOrder(unknown)).toEqual([]);
    expect(validateOrder(unknown, { catalog: new StaticProductCatalog() })[0].message).toBe(
      "Unknown SKU NOPE-1",
    );
  });
});
