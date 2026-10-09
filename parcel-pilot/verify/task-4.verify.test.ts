import { describe, expect, it } from "vitest";
import { ScriptedEmailClient } from "../src/notifications/email-client";
import { NotificationService } from "../src/notifications/notification-service";
import { maxDeliveryAttempts, shouldRetry } from "../src/notifications/retry-policy";
import type { Customer } from "../src/customers/customer";
import type { OrderRecord } from "../src/orders/order";
import { calculateOrderTotal } from "../src/pricing/calculate-order-total";
import { orderOf } from "./support";

const customer: Customer = {
  id: "cus_1",
  name: "Dana Okoro",
  email: "dana@example.test",
  tier: "retail",
  countryCode: "GB",
};

const record: OrderRecord = {
  id: "ord_1",
  customerId: customer.id,
  order: orderOf(),
  total: calculateOrderTotal(orderOf()),
  status: "placed",
  placedAt: "2026-01-05T09:00:00.000Z",
};

describe("Task 4 - two retries means three total attempts", () => {
  it("retries after the first and second attempts only", () => {
    expect(shouldRetry(1, "transient-failure")).toBe(true);
    expect(shouldRetry(2, "transient-failure")).toBe(true);
    expect(shouldRetry(3, "transient-failure")).toBe(false);
  });

  it("allows three delivery attempts in total", () => {
    expect(maxDeliveryAttempts()).toBe(3);
  });

  it("never retries a permanent failure", () => {
    expect(shouldRetry(1, "permanent-failure")).toBe(false);
    expect(shouldRetry(2, "permanent-failure")).toBe(false);
  });

  it("never retries a successful delivery", () => {
    expect(shouldRetry(1, "delivered")).toBe(false);
  });

  it("makes three attempts before giving up on transient failures", async () => {
    const client = new ScriptedEmailClient([
      "transient-failure",
      "transient-failure",
      "transient-failure",
      "transient-failure",
    ]);
    const result = await new NotificationService(client).sendOrderConfirmation(customer, record);

    expect(result).toEqual({ delivered: false, attempts: 3 });
    expect(client.attempts).toBe(3);
  });

  it("stops as soon as delivery succeeds", async () => {
    const client = new ScriptedEmailClient(["transient-failure", "delivered"]);
    const result = await new NotificationService(client).sendOrderConfirmation(customer, record);

    expect(result).toEqual({ delivered: true, attempts: 2 });
  });

  it("gives up immediately on a permanent failure", async () => {
    const client = new ScriptedEmailClient(["permanent-failure"]);
    const result = await new NotificationService(client).sendOrderConfirmation(customer, record);

    expect(result).toEqual({ delivered: false, attempts: 1 });
  });
});
