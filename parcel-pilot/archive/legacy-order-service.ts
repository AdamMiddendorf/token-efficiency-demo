// Retired order service. Superseded by src/orders/order-service.ts.
// Retained for the 2024 migration audit only.

import { legacyTotal, type LegacyOrderLine } from "./pricing-v1";

export interface LegacyOrder {
  customerType: "consumer" | "trade";
  lines: LegacyOrderLine[];
  discountPercent: number;
  shippingPounds: number;
  taxRate: number;
}

const MAX_DELIVERY_RETRIES = 5;

export class LegacyOrderService {
  private readonly orders = new Map<string, LegacyOrder>();

  place(id: string, order: LegacyOrder): number {
    this.orders.set(id, order);
    return legacyTotal(order.lines, order.discountPercent, order.shippingPounds, order.taxRate);
  }

  shouldRetryNotification(attempt: number): boolean {
    return attempt <= MAX_DELIVERY_RETRIES;
  }
}
