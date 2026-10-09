import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app/build-app";
import type { Customer } from "../../src/customers/customer";
import { ScriptedEmailClient } from "../../src/notifications/email-client";
import { nullLogger } from "../../src/observability/logger";
import { fixedClock } from "../../src/shared/clock";
import { SequentialIdGenerator } from "../../src/shared/id";

const customers: Customer[] = [
  { id: "cus_1", name: "Dana Okoro", email: "dana@example.test", tier: "retail", countryCode: "GB" },
  {
    id: "cus_2",
    name: "Northfield Supplies",
    email: "ap@northfield.example",
    tier: "wholesale",
    countryCode: "GB",
  },
];

function app(emailClient = new ScriptedEmailClient()) {
  return buildApp({
    clock: fixedClock("2026-01-05T09:00:00.000Z"),
    ids: new SequentialIdGenerator(),
    logger: nullLogger,
    emailClient,
    customers,
    stock: [
      { sku: "BOX-A", onHand: 50, reserved: 0 },
      { sku: "TAPE-1", onHand: 10, reserved: 0 },
    ],
  });
}

const orderBody = {
  customerId: "cus_1",
  customerTier: "retail",
  lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 5_000 }],
  shippingMethod: "standard",
  countryCode: "GB",
};

describe("Parcel Pilot HTTP app", () => {
  it("reports its health", async () => {
    const response = await app().http.handle({ method: "GET", path: "/health" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok" });
    expect(response.headers["x-request-id"]).toMatch(/^req_/);
  });

  it("creates an order, reserves stock and confirms it", async () => {
    const emailClient = new ScriptedEmailClient();
    const pilot = app(emailClient);

    const response = await pilot.http.handle({ method: "POST", path: "/orders", body: orderBody });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "placed",
      totals: { subtotal: 5_000, discount: 0, currency: "GBP" },
    });
    expect(pilot.inventory.available("BOX-A")).toBe(49);
    expect(emailClient.attempts).toBe(1);
    expect(pilot.metrics.counter("orders.placed", { tier: "retail" })).toBe(1);
  });

  it("reads an order back by id", async () => {
    const pilot = app();
    const created = await pilot.http.handle({ method: "POST", path: "/orders", body: orderBody });
    const id = (created.body as { id: string }).id;

    const response = await pilot.http.handle({ method: "GET", path: `/orders/${id}` });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id });
  });

  it("lists the orders of a customer", async () => {
    const pilot = app();
    await pilot.http.handle({ method: "POST", path: "/orders", body: orderBody });
    await pilot.http.handle({ method: "POST", path: "/orders", body: orderBody });

    const response = await pilot.http.handle({
      method: "GET",
      path: "/customers/cus_1/orders",
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 2 });
  });

  it("applies a promotion code submitted with the order", async () => {
    const pilot = app();

    const response = await pilot.http.handle({
      method: "POST",
      path: "/orders",
      body: { ...orderBody, promoCode: "welcome10" },
    });

    // 10% of £50 is £5. What that discount is worth is pricing's decision;
    // the promotion only supplied the percentage.
    expect(response.body).toMatchObject({ totals: { subtotal: 5_000, discount: 500 } });
  });

  it("ignores a promotion code the customer is not eligible for", async () => {
    const pilot = app();

    const response = await pilot.http.handle({
      method: "POST",
      path: "/orders",
      body: { ...orderBody, promoCode: "TRADE15" },
    });

    expect(response.body).toMatchObject({ totals: { discount: 0 } });
  });

  it("rejects an order for an unknown customer", async () => {
    const response = await app().http.handle({
      method: "POST",
      path: "/orders",
      body: { ...orderBody, customerId: "cus_missing" },
    });

    expect(response.status).toBe(404);
  });

  it("rejects a malformed body without touching the domain", async () => {
    const pilot = app();
    const response = await pilot.http.handle({
      method: "POST",
      path: "/orders",
      body: { ...orderBody, lines: [] as unknown[] },
    });

    expect(response.status).toBe(400);
    expect(pilot.inventory.available("BOX-A")).toBe(50);
  });

  it("refuses an order it cannot stock, and reserves nothing", async () => {
    const pilot = app();
    const response = await pilot.http.handle({
      method: "POST",
      path: "/orders",
      body: { ...orderBody, lines: [{ sku: "TAPE-1", quantity: 99, unitPrice: 499 }] },
    });

    expect(response.status).toBe(400);
    expect(pilot.inventory.available("TAPE-1")).toBe(10);
  });

  it("quotes an order without storing or sending anything", async () => {
    const emailClient = new ScriptedEmailClient();
    const pilot = app(emailClient);

    const response = await pilot.http.handle({
      method: "POST",
      path: "/quotes",
      body: orderBody,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      shipping: { selectedMethod: "standard", zone: "domestic", estimatedDeliveryDate: "2026-01-08" },
    });
    expect(emailClient.attempts).toBe(0);
    expect(pilot.metrics.counter("orders.placed", { tier: "retail" })).toBe(0);
  });

  it("returns 404 for an unknown route", async () => {
    const response = await app().http.handle({ method: "GET", path: "/nope" });
    expect(response.status).toBe(404);
  });

  it("publishes a domain event for each placed order", async () => {
    const pilot = app();
    const seen: string[] = [];
    pilot.events.on("*", (event) => void seen.push(event.type));

    await pilot.http.handle({ method: "POST", path: "/orders", body: orderBody });

    expect(seen).toContain("order.placed");
    expect(seen).toContain("order.notified");
  });
});
