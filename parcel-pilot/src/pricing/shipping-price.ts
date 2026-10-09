import type { ShippingMethod } from "../shipping/shipping-method";
import type { Money } from "./money";
import { defaultPricingPolicy, type PricingPolicy } from "./pricing-policy";

export interface ShippingPriceInput {
  method: ShippingMethod;
  /** Merchandise subtotal after discount, before shipping and tax. */
  discountedMerchandiseSubtotal: Money;
}

/** The amount charged for shipping, in minor units. */
export function shippingPriceFor(
  input: ShippingPriceInput,
  policy: PricingPolicy = defaultPricingPolicy,
): Money {
  return input.method === "express"
    ? policy.expressShippingMinorUnits
    : policy.standardShippingMinorUnits;
}
