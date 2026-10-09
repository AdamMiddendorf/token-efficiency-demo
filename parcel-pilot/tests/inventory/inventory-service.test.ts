import { describe, expect, it } from "vitest";
import { InventoryService, OutOfStockError } from "../../src/inventory/inventory-service";
import { fixedClock } from "../../src/shared/clock";

function service() {
  return new InventoryService({
    initialStock: [
      { sku: "BOX-A", onHand: 10, reserved: 0 },
      { sku: "TAPE-1", onHand: 2, reserved: 0 },
    ],
    clock: fixedClock("2026-01-05T09:00:00.000Z"),
  });
}

describe("InventoryService", () => {
  it("reserves stock without removing it", () => {
    const inventory = service();
    const result = inventory.reserve("ord_1", [{ sku: "BOX-A", quantity: 3 }]);

    expect(result.ok).toBe(true);
    expect(inventory.available("BOX-A")).toBe(7);
    expect(inventory.levelFor("BOX-A").onHand).toBe(10);
  });

  it("reports every short line at once", () => {
    const inventory = service();
    const result = inventory.reserve("ord_1", [
      { sku: "BOX-A", quantity: 3 },
      { sku: "TAPE-1", quantity: 5 },
      { sku: "WRAP-2", quantity: 1 },
    ]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(OutOfStockError);
    expect((result.error as OutOfStockError).shortfall.map((line) => line.sku)).toEqual([
      "TAPE-1",
      "WRAP-2",
    ]);
  });

  it("reserves nothing when any line is short", () => {
    const inventory = service();
    inventory.reserve("ord_1", [
      { sku: "BOX-A", quantity: 1 },
      { sku: "TAPE-1", quantity: 9 },
    ]);

    expect(inventory.available("BOX-A")).toBe(10);
  });

  it("returns stock on release", () => {
    const inventory = service();
    const result = inventory.reserve("ord_1", [{ sku: "BOX-A", quantity: 4 }]);
    if (!result.ok) throw new Error("expected a reservation");

    inventory.release(result.value.id);

    expect(inventory.available("BOX-A")).toBe(10);
    expect(inventory.reservationFor(result.value.id)?.status).toBe("released");
  });

  it("removes stock on consume", () => {
    const inventory = service();
    const result = inventory.reserve("ord_1", [{ sku: "BOX-A", quantity: 4 }]);
    if (!result.ok) throw new Error("expected a reservation");

    inventory.consume(result.value.id);

    expect(inventory.levelFor("BOX-A")).toEqual({ sku: "BOX-A", onHand: 6, reserved: 0 });
  });

  it("ignores a release that has already happened", () => {
    const inventory = service();
    const result = inventory.reserve("ord_1", [{ sku: "BOX-A", quantity: 4 }]);
    if (!result.ok) throw new Error("expected a reservation");

    inventory.release(result.value.id);
    inventory.release(result.value.id);

    expect(inventory.available("BOX-A")).toBe(10);
  });
});
