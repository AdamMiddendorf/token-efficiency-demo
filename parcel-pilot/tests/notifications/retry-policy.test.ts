import { describe, expect, it } from "vitest";
import { maxDeliveryAttempts, shouldRetry } from "../../src/notifications/retry-policy";

describe("shouldRetry", () => {
  it("retries transient failures until the attempt limit is reached", () => {
    expect(shouldRetry(1, "transient-failure")).toBe(true);
    expect(shouldRetry(2, "transient-failure")).toBe(true);
    expect(shouldRetry(3, "transient-failure")).toBe(true);
    expect(shouldRetry(4, "transient-failure")).toBe(false);
  });

  it("never retries a permanent failure", () => {
    expect(shouldRetry(1, "permanent-failure")).toBe(false);
  });

  it("never retries a successful delivery", () => {
    expect(shouldRetry(1, "delivered")).toBe(false);
  });

  it("reports the total number of attempts allowed", () => {
    expect(maxDeliveryAttempts()).toBe(4);
  });
});
