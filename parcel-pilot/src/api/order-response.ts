import type { OrderRecord } from "../orders/order";

/**
 * Public API response shape. Fields may be added, but existing fields must not
 * be renamed, removed, or change type: external clients depend on them.
 */
export interface OrderTotalResponse {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface OrderResponse {
  id: string;
  status: string;
  placedAt: string;
  totals: OrderTotalResponse;
}

export function toOrderResponse(record: OrderRecord, currency = "GBP"): OrderResponse {
  return {
    id: record.id,
    status: record.status,
    placedAt: record.placedAt,
    totals: {
      subtotal: record.total.subtotal,
      discount: record.total.discount,
      shipping: record.total.shipping,
      tax: record.total.tax,
      total: record.total.total,
      currency,
    },
  };
}
