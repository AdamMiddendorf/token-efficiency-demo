import { describe, expect, it } from "vitest";
import { StaticProductCatalog, totalWeightGrams } from "../../src/catalog/product-catalog";
import { NotFoundError } from "../../src/shared/errors";

const catalog = new StaticProductCatalog();

describe("StaticProductCatalog", () => {
  it("looks up a SKU regardless of case", () => {
    expect(catalog.find("box-a")?.name).toBe("Small shipping box");
  });

  it("returns undefined for an unknown SKU", () => {
    expect(catalog.find("NOPE-1")).toBeUndefined();
  });

  it("throws when a SKU is required but missing", () => {
    expect(() => catalog.require("NOPE-1")).toThrow(NotFoundError);
  });

  it("filters by category", () => {
    const consumables = catalog.listByCategory("consumable");
    expect(consumables.length).toBeGreaterThan(0);
    expect(consumables.every((product) => product.category === "consumable")).toBe(true);
  });
});

describe("totalWeightGrams", () => {
  it("sums the weight of every line", () => {
    expect(
      totalWeightGrams(catalog, [
        { sku: "BOX-A", quantity: 2 },
        { sku: "TAPE-1", quantity: 1 },
      ]),
    ).toBe(455);
  });

  it("ignores unknown SKUs rather than failing a weight estimate", () => {
    expect(totalWeightGrams(catalog, [{ sku: "NOPE-1", quantity: 3 }])).toBe(0);
  });
});
