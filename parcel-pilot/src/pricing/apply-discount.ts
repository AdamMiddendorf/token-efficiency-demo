import type { CustomerTier } from "../customers/customer-tier";
import { ValidationError } from "../shared/errors";
import { type Money, percentOf } from "./money";
import { defaultPricingPolicy, type PricingPolicy } from "./pricing-policy";

export interface DiscountInput {
  /** Merchandise subtotal before any discount, in minor units. */
  subtotal: Money;
  customerTier: CustomerTier;
  /** Whole or fractional percentage, e.g. 10 for 10%. */
  discountPercent?: number;
}

/**
 * Returns the discount amount to subtract from the merchandise subtotal.
 * The caller subtracts it; this function never returns a negative number.
 */
export function applyDiscount(
  input: DiscountInput,
  policy: PricingPolicy = defaultPricingPolicy,
): Money {
  void policy;
  const percent = input.discountPercent ?? 0;

  if (percent < 0 || percent > 100) {
    throw new ValidationError(`discountPercent must be between 0 and 100, received ${percent}`);
  }
  if (percent === 0) {
    return 0;
  }

  return percentOf(input.subtotal, percent);
}
