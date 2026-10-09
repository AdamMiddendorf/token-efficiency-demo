/**
 * Configurable pricing rules. Keeping them in one place avoids literal amounts
 * being duplicated across the pricing pipeline.
 */
export interface PricingPolicy {
  /** Flat charge for standard shipping, in minor units. */
  standardShippingMinorUnits: number;
  /** Flat charge for express shipping, in minor units. */
  expressShippingMinorUnits: number;
}

export const defaultPricingPolicy: PricingPolicy = {
  standardShippingMinorUnits: 500,
  expressShippingMinorUnits: 1500,
};
