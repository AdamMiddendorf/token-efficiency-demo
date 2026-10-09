import type { Logger } from "../observability/logger";
import type { OrderRecord } from "./order";

export type OrderEvent =
  | { type: "order.placed"; orderId: string; customerId: string; totalMinorUnits: number; at: string }
  | { type: "order.rejected"; customerId: string; reason: string; at: string }
  | { type: "order.cancelled"; orderId: string; at: string }
  | { type: "order.notified"; orderId: string; attempts: number; delivered: boolean; at: string };

export type OrderEventType = OrderEvent["type"];
export type OrderEventHandler = (event: OrderEvent) => void | Promise<void>;

export function orderPlaced(record: OrderRecord): OrderEvent {
  return {
    type: "order.placed",
    orderId: record.id,
    customerId: record.customerId,
    totalMinorUnits: record.total.total,
    at: record.placedAt,
  };
}

/**
 * In-process event bus. A failing subscriber is logged and skipped: one
 * subscriber must never prevent the others from seeing an event, and an
 * analytics failure must never fail an order.
 */
export class OrderEventBus {
  private readonly handlers = new Map<OrderEventType | "*", OrderEventHandler[]>();
  private readonly logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  on(type: OrderEventType | "*", handler: OrderEventHandler): () => void {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);
    return () => {
      this.handlers.set(
        type,
        (this.handlers.get(type) ?? []).filter((candidate) => candidate !== handler),
      );
    };
  }

  async publish(event: OrderEvent): Promise<void> {
    const handlers = [...(this.handlers.get(event.type) ?? []), ...(this.handlers.get("*") ?? [])];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger?.warn("order event handler failed", {
          eventType: event.type,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
