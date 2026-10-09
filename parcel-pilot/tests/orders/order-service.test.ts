import { describe, expect, it } from "vitest";
import type { Customer } from "../../src/customers/customer";
import { NotificationService } from "../../src/notifications/notification-service";
import { ScriptedEmailClient } from "../../src/notifications/email-client";
import { InMemoryOrderRepository } from "../../src/orders/in-memory-order-repository";
import type { Order } from "../../src/orders/order";
import { OrderService } from "../../src/orders/order-service";
import { fixedClock } from "../../src/shared/clock";

const customer: Customer = {
  id: "cus_1",
  name: "Dana Okoro",
  email: "dana@example.test",
  tier: "retail",
  countryCode: "GB",
};

const order: Order = {
  customerTier: "retail",
  lines: [{ sku: "BOX-A", quantity: 2, unitPrice: 2_500 }],
  shippingMethod: "standard",
  countryCode: "GB",
};

function buildService(emailClient = new ScriptedEmailClient()) {
  const repository = new InMemoryOrderRepository();
  const service = new OrderService({
    repository,
    notifications: new NotificationService(emailClient),
    clock: fixedClock("2026-01-05T09:00:00.000Z"),
    newId: () => "ord_test_1",
  });
  return { repository, service };
}

describe("OrderService", () => {
  it("prices, stores and confirms a placed order", async () => {
    const emailClient = new ScriptedEmailClient();
    const { service } = buildService(emailClient);

    const result = await service.placeOrder(order, customer);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.total.subtotal).toBe(5_000);
    expect(result.value.placedAt).toBe("2026-01-05T09:00:00.000Z");
    expect(emailClient.attempts).toBe(1);
    expect(await service.getOrder("ord_test_1")).toBeDefined();
  });

  it("rejects an empty order", async () => {
    const { service } = buildService();
    const result = await service.placeOrder({ ...order, lines: [] }, customer);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/at least one line/);
  });

  it("downgrades express shipping where it is unavailable", async () => {
    const { service } = buildService();
    const result = await service.placeOrder(
      { ...order, shippingMethod: "express", countryCode: "AU" },
      { ...customer, countryCode: "AU" },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.order.shippingMethod).toBe("standard");
  });
});
