import type { Order, OrderTotal } from "../src/orders/order";

export function orderOf(overrides: Partial<Order> = {}): Order {
  return {
    customerTier: "retail",
    lines: [{ sku: "BOX-A", quantity: 1, unitPrice: 10_000 }],
    shippingMethod: "standard",
    countryCode: "GB",
    ...overrides,
  };
}

/** Builds an order whose merchandise subtotal is exactly `subtotal`. */
export function orderWithSubtotal(subtotal: number, overrides: Partial<Order> = {}): Order {
  return orderOf({ lines: [{ sku: "BULK", quantity: 1, unitPrice: subtotal }], ...overrides });
}

export function allAmountsAreIntegers(total: OrderTotal): boolean {
  return Object.values(total).every((amount) => Number.isInteger(amount));
}
