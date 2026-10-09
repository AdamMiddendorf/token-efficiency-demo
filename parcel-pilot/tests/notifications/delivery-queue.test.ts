import { describe, expect, it } from "vitest";
import { DeliveryQueue, backoffSecondsAfter } from "../../src/notifications/delivery-queue";
import { maxDeliveryAttempts } from "../../src/notifications/retry-policy";
import type { EmailMessage } from "../../src/notifications/email-client";
import { fixedClock } from "../../src/shared/clock";

const message: EmailMessage = {
  to: "dana@example.test",
  subject: "Your Parcel Pilot order ord_1",
  body: "...",
};

function queue() {
  return new DeliveryQueue(fixedClock("2026-01-05T09:00:00.000Z"));
}

describe("DeliveryQueue", () => {
  it("makes a new item immediately due", () => {
    const q = queue();
    q.enqueue("ord_1", message);

    expect(q.due()).toHaveLength(1);
  });

  it("marks a delivered item as done", () => {
    const q = queue();
    const item = q.enqueue("ord_1", message);

    expect(q.recordOutcome(item.id, "delivered")?.status).toBe("delivered");
    expect(q.due()).toHaveLength(0);
  });

  it("dead-letters a permanent failure on the first attempt", () => {
    const q = queue();
    const item = q.enqueue("ord_1", message);

    const updated = q.recordOutcome(item.id, "permanent-failure");

    expect(updated?.status).toBe("dead-lettered");
    expect(updated?.attempts).toBe(1);
  });

  it("dead-letters a transient failure once the retry policy gives up", () => {
    const q = queue();
    const item = q.enqueue("ord_1", message);

    // The queue defers to the retry policy, so this stays correct if the
    // retry limit changes.
    for (let i = 0; i < maxDeliveryAttempts(); i += 1) {
      q.recordOutcome(item.id, "transient-failure");
    }

    const dead = q.deadLettered();
    expect(dead).toHaveLength(1);
    expect(dead[0].attempts).toBe(maxDeliveryAttempts());
  });

  it("backs off further after each attempt", () => {
    expect(backoffSecondsAfter(1)).toBe(30);
    expect(backoffSecondsAfter(2)).toBe(300);
    expect(backoffSecondsAfter(99)).toBe(7_200);
  });

  it("schedules the next attempt in the future after a transient failure", () => {
    const q = queue();
    const item = q.enqueue("ord_1", message);

    const updated = q.recordOutcome(item.id, "transient-failure");

    expect(updated?.status).toBe("pending");
    expect(new Date(updated!.nextAttemptAt).getTime()).toBeGreaterThan(
      new Date("2026-01-05T09:00:00.000Z").getTime(),
    );
    expect(q.due()).toHaveLength(0);
  });
});
