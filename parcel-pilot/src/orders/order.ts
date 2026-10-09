import type { CustomerTier } from "../customers/customer-tier";
import type { ShippingMethod } from "../shipping/shipping-method";

export interface OrderLine {
  sku: string;
  quantity: number;
  /** Integer minor units. */
  unitPrice: number;
}

export interface Order {
  customerTier: CustomerTier;
  lines: OrderLine[];
  /** Whole or fractional percentage, e.g. 10 for 10%. */
  discountPercent?: number;
  /**
   * Campaign code submitted with the order. It is resolved to a
   * `discountPercent` before pricing runs; the pricing pipeline never sees it.
   */
  promoCode?: string;
  shippingMethod: ShippingMethod;
  countryCode: string;
}

export interface OrderTotal {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export type OrderStatus = "placed" | "cancelled";

export interface OrderRecord {
  id: string;
  customerId: string;
  order: Order;
  total: OrderTotal;
  status: OrderStatus;
  placedAt: string;
  /** Set when stock was reserved for this order. */
  reservationId?: string;
}
