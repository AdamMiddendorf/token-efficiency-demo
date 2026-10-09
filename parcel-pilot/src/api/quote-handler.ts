import { estimateDelivery } from "../shipping/delivery-estimate";
import type { ShippingMethod } from "../shipping/shipping-method";
import { selectShippingMethod } from "../shipping/shipping-selector";
import { calculateOrderTotal } from "../pricing/calculate-order-total";
import { priceBreakdown } from "../pricing/price-breakdown";
import type { PricingPolicy } from "../pricing/pricing-policy";
import type { Order } from "../orders/order";
import type { Clock } from "../shared/clock";
import type { HandlerResponse } from "./handler-response";

export interface QuoteResponse {
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  breakdown: { label: string; amountMinorUnits: number; formatted: string }[];
  shipping: {
    requestedMethod: ShippingMethod;
    selectedMethod: ShippingMethod;
    zone: string;
    workingDays: number;
    estimatedDeliveryDate: string;
  };
}

export interface QuoteHandlerDeps {
  clock: Clock;
  currency: string;
  pricingPolicy?: PricingPolicy;
}

/**
 * A non-binding quote: the same pricing pipeline an order would use, plus a
 * delivery estimate. It stores nothing and sends nothing.
 */
export async function quoteHandler(
  order: Order,
  deps: QuoteHandlerDeps,
): Promise<HandlerResponse<QuoteResponse>> {
  const selectedMethod = selectShippingMethod({
    requestedMethod: order.shippingMethod,
    countryCode: order.countryCode,
  });

  const total = deps.pricingPolicy
    ? calculateOrderTotal({ ...order, shippingMethod: selectedMethod }, deps.pricingPolicy)
    : calculateOrderTotal({ ...order, shippingMethod: selectedMethod });

  const estimate = estimateDelivery(order.countryCode, selectedMethod, deps.clock);

  return {
    status: 200,
    body: {
      totals: { ...total, currency: deps.currency },
      breakdown: priceBreakdown(total, deps.currency),
      shipping: {
        requestedMethod: order.shippingMethod,
        selectedMethod,
        zone: estimate.zone,
        workingDays: estimate.workingDays,
        estimatedDeliveryDate: estimate.estimatedDeliveryDate,
      },
    },
  };
}
