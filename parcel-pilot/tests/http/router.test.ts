import { describe, expect, it } from "vitest";
import { Router } from "../../src/http/router";

const noop = () => ({ status: 200, body: null, headers: {} });

describe("Router", () => {
  it("matches a static path", () => {
    const router = new Router().get("/health", noop);
    expect(router.match("GET", "/health")).toBeDefined();
  });

  it("is case-insensitive about the method", () => {
    const router = new Router().get("/health", noop);
    expect(router.match("get", "/health")).toBeDefined();
  });

  it("does not match a different method", () => {
    const router = new Router().get("/health", noop);
    expect(router.match("POST", "/health")).toBeUndefined();
  });

  it("extracts path parameters", () => {
    const router = new Router().get("/orders/:id", noop);
    expect(router.match("GET", "/orders/ord_1")?.params).toEqual({ id: "ord_1" });
  });

  it("extracts several parameters", () => {
    const router = new Router().get("/customers/:customerId/orders/:orderId", noop);
    expect(router.match("GET", "/customers/cus_1/orders/ord_9")?.params).toEqual({
      customerId: "cus_1",
      orderId: "ord_9",
    });
  });

  it("decodes percent-encoded parameters", () => {
    const router = new Router().get("/orders/:id", noop);
    expect(router.match("GET", "/orders/ord%2F1")?.params).toEqual({ id: "ord/1" });
  });

  it("does not match a path of a different length", () => {
    const router = new Router().get("/orders/:id", noop);
    expect(router.match("GET", "/orders")).toBeUndefined();
    expect(router.match("GET", "/orders/ord_1/lines")).toBeUndefined();
  });

  it("ignores trailing slashes", () => {
    const router = new Router().get("/health", noop);
    expect(router.match("GET", "/health/")).toBeDefined();
  });

  it("describes its routes", () => {
    const router = new Router().get("/health", noop).post("/orders", noop);
    expect(router.describe()).toEqual(["GET /health", "POST /orders"]);
  });
});
