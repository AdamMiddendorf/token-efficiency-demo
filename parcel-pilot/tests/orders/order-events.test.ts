import { describe, expect, it } from "vitest";
import { OrderEventBus, orderPlaced, type OrderEvent } from "../../src/orders/order-events";
import { RecordingLogger } from "../../src/observability/logger";
import type { OrderRecord } from "../../src/orders/order";

const record: OrderRecord = {
  id: "ord_1",
  customerId: "cus_1",
  order: {
    customerTier: "retail",
    lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 5_000 }],
    shippingMethod: "standard",
    countryCode: "GB",
  },
  total: { subtotal: 5_000, discount: 0, shipping: 500, tax: 1_100, total: 6_600 },
  status: "placed",
  placedAt: "2026-01-05T09:00:00.000Z",
};

describe("OrderEventBus", () => {
  it("delivers an event to subscribers of that type", async () => {
    const bus = new OrderEventBus();
    const seen: OrderEvent[] = [];
    bus.on("order.placed", (event) => void seen.push(event));

    await bus.publish(orderPlaced(record));

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ type: "order.placed", orderId: "ord_1", totalMinorUnits: 6_600 });
  });

  it("delivers every event to wildcard subscribers", async () => {
    const bus = new OrderEventBus();
    const seen: string[] = [];
    bus.on("*", (event) => void seen.push(event.type));

    await bus.publish(orderPlaced(record));
    await bus.publish({ type: "order.cancelled", orderId: "ord_1", at: record.placedAt });

    expect(seen).toEqual(["order.placed", "order.cancelled"]);
  });

  it("does not deliver to a subscriber of another type", async () => {
    const bus = new OrderEventBus();
    const seen: string[] = [];
    bus.on("order.cancelled", (event) => void seen.push(event.type));

    await bus.publish(orderPlaced(record));

    expect(seen).toEqual([]);
  });

  it("stops delivering after unsubscribe", async () => {
    const bus = new OrderEventBus();
    const seen: string[] = [];
    const off = bus.on("order.placed", (event) => void seen.push(event.type));

    off();
    await bus.publish(orderPlaced(record));

    expect(seen).toEqual([]);
  });

  it("isolates a failing subscriber from the others", async () => {
    const logger = new RecordingLogger();
    const bus = new OrderEventBus(logger);
    const seen: string[] = [];

    bus.on("order.placed", () => {
      throw new Error("analytics is down");
    });
    bus.on("order.placed", (event) => void seen.push(event.type));

    await expect(bus.publish(orderPlaced(record))).resolves.toBeUndefined();
    expect(seen).toEqual(["order.placed"]);
    expect(logger.records.some((entry) => entry.message.includes("handler failed"))).toBe(true);
  });
});
