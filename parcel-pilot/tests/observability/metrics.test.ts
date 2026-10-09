import { describe, expect, it } from "vitest";
import { MetricsRegistry } from "../../src/observability/metrics";

describe("MetricsRegistry", () => {
  it("accumulates counters per label set", () => {
    const metrics = new MetricsRegistry();

    metrics.increment("orders.placed", { tier: "retail" });
    metrics.increment("orders.placed", { tier: "retail" });
    metrics.increment("orders.placed", { tier: "wholesale" });

    expect(metrics.counter("orders.placed", { tier: "retail" })).toBe(2);
    expect(metrics.counter("orders.placed", { tier: "wholesale" })).toBe(1);
    expect(metrics.counter("orders.placed")).toBe(0);
  });

  it("treats label order as insignificant", () => {
    const metrics = new MetricsRegistry();

    metrics.increment("x", { a: "1", b: "2" });
    metrics.increment("x", { b: "2", a: "1" });

    expect(metrics.counter("x", { a: "1", b: "2" })).toBe(2);
  });

  it("summarises histograms in the snapshot", () => {
    const metrics = new MetricsRegistry();

    metrics.observe("latency", 10);
    metrics.observe("latency", 30);

    expect(metrics.samples("latency")).toEqual([10, 30]);
    expect(metrics.snapshot()).toMatchObject({ "latency.count": 2, "latency.sum": 40 });
  });
});
