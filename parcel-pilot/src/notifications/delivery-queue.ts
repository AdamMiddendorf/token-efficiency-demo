import { type Clock, systemClock } from "../shared/clock";
import { type IdGenerator, SequentialIdGenerator } from "../shared/id";
import type { DeliveryOutcome, EmailMessage } from "./email-client";
import { shouldRetry } from "./retry-policy";

export type QueuedDeliveryStatus = "pending" | "delivered" | "dead-lettered";

export interface QueuedDelivery {
  id: string;
  orderId: string;
  message: EmailMessage;
  attempts: number;
  status: QueuedDeliveryStatus;
  nextAttemptAt: string;
}

/**
 * Delay before the *next* attempt, indexed by the number of attempts already
 * made. The queue decides *when* to try again; `retry-policy.ts` decides
 * *whether* to try again. Keep those two questions separate.
 */
const BACKOFF_SECONDS = [30, 300, 1_800, 7_200];

export function backoffSecondsAfter(attempts: number): number {
  const index = Math.min(Math.max(attempts - 1, 0), BACKOFF_SECONDS.length - 1);
  return BACKOFF_SECONDS[index];
}

export class DeliveryQueue {
  private readonly items = new Map<string, QueuedDelivery>();
  private readonly clock: Clock;
  private readonly ids: IdGenerator;

  constructor(clock: Clock = systemClock, ids: IdGenerator = new SequentialIdGenerator()) {
    this.clock = clock;
    this.ids = ids;
  }

  enqueue(orderId: string, message: EmailMessage): QueuedDelivery {
    const item: QueuedDelivery = {
      id: this.ids.next("ntf"),
      orderId,
      message,
      attempts: 0,
      status: "pending",
      nextAttemptAt: this.clock.now().toISOString(),
    };
    this.items.set(item.id, item);
    return item;
  }

  /** Items that are pending and whose backoff has elapsed. */
  due(): QueuedDelivery[] {
    const now = this.clock.now().getTime();
    return [...this.items.values()].filter(
      (item) => item.status === "pending" && new Date(item.nextAttemptAt).getTime() <= now,
    );
  }

  /**
   * Records the result of one attempt. Whether another attempt happens is
   * delegated to the retry policy, so the queue cannot drift away from the
   * business rule.
   */
  recordOutcome(id: string, outcome: DeliveryOutcome): QueuedDelivery | undefined {
    const item = this.items.get(id);
    if (!item || item.status !== "pending") {
      return item;
    }

    const attempts = item.attempts + 1;

    if (outcome === "delivered") {
      const updated: QueuedDelivery = { ...item, attempts, status: "delivered" };
      this.items.set(id, updated);
      return updated;
    }

    if (!shouldRetry(attempts, outcome)) {
      const updated: QueuedDelivery = { ...item, attempts, status: "dead-lettered" };
      this.items.set(id, updated);
      return updated;
    }

    const nextAttemptAt = new Date(
      this.clock.now().getTime() + backoffSecondsAfter(attempts) * 1_000,
    ).toISOString();
    const updated: QueuedDelivery = { ...item, attempts, nextAttemptAt };
    this.items.set(id, updated);
    return updated;
  }

  deadLettered(): QueuedDelivery[] {
    return [...this.items.values()].filter((item) => item.status === "dead-lettered");
  }

  get size(): number {
    return this.items.size;
  }
}
