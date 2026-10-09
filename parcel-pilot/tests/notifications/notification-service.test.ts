import { describe, expect, it } from "vitest";
import { ScriptedEmailClient } from "../../src/notifications/email-client";
import { NotificationLog } from "../../src/notifications/notification-log";
import { NotificationService } from "../../src/notifications/notification-service";
import { maxDeliveryAttempts } from "../../src/notifications/retry-policy";
import type { Customer } from "../../src/customers/customer";
import type { OrderRecord } from "../../src/orders/order";
import { fixedClock } from "../../src/shared/clock";

const customer: Customer = {
  id: "cus_1",
  name: "Dana Okoro",
  email: "dana@example.test",
  tier: "retail",
  countryCode: "GB",
};

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

const clock = fixedClock("2026-01-05T09:00:00.000Z");

describe("NotificationService", () => {
  it("delivers on the first attempt when the provider accepts it", async () => {
    const client = new ScriptedEmailClient();
    const result = await new NotificationService(client, { clock }).sendOrderConfirmation(
      customer,
      record,
    );

    expect(result).toEqual({ delivered: true, attempts: 1 });
    expect(client.sent[0].subject).toContain("ord_1");
  });

  it("gives up immediately on a permanent failure", async () => {
    const client = new ScriptedEmailClient(["permanent-failure"]);
    const result = await new NotificationService(client, { clock }).sendOrderConfirmation(
      customer,
      record,
    );

    expect(result).toEqual({ delivered: false, attempts: 1 });
  });

  it("stops at the number of attempts the retry policy allows", async () => {
    const client = new ScriptedEmailClient(
      Array.from({ length: 10 }, () => "transient-failure" as const),
    );
    const result = await new NotificationService(client, { clock }).sendOrderConfirmation(
      customer,
      record,
    );

    expect(result.delivered).toBe(false);
    expect(result.attempts).toBe(maxDeliveryAttempts());
  });

  it("records every attempt in the notification log", async () => {
    const log = new NotificationLog();
    const client = new ScriptedEmailClient(["transient-failure", "delivered"]);

    await new NotificationService(client, { clock, log }).sendOrderConfirmation(customer, record);

    expect(log.attemptCount("ord_1")).toBe(2);
    expect(log.forOrder("ord_1").map((entry) => entry.outcome)).toEqual([
      "transient-failure",
      "delivered",
    ]);
  });

  it("renders the customer's total into the message body", async () => {
    const client = new ScriptedEmailClient();
    await new NotificationService(client, { clock }).sendOrderConfirmation(customer, record);

    expect(client.sent[0].body).toContain("£66.00");
  });
});
