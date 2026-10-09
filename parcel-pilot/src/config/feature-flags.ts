/**
 * Feature flags are read once at startup and passed explicitly. Nothing reads
 * `process.env` outside `src/config/`, so tests configure behaviour by
 * constructing a config object rather than by mutating the environment.
 */
export interface FeatureFlags {
  /** Emit a domain event for every order lifecycle transition. */
  orderEvents: boolean;
  /** Reserve stock before accepting an order. */
  inventoryReservations: boolean;
  /** Resolve promotion codes submitted with an order. */
  promotionCodes: boolean;
  /** Include a line-by-line price breakdown in API responses. */
  verbosePriceBreakdown: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  orderEvents: true,
  inventoryReservations: true,
  promotionCodes: true,
  verbosePriceBreakdown: false,
};

export function flagsFromEnv(
  env: Record<string, string | undefined>,
  base: FeatureFlags = defaultFeatureFlags,
): FeatureFlags {
  const read = (name: string, fallback: boolean): boolean => {
    const raw = env[name];
    if (raw === undefined) return fallback;
    return raw === "1" || raw.toLowerCase() === "true";
  };

  return {
    orderEvents: read("FEATURE_ORDER_EVENTS", base.orderEvents),
    inventoryReservations: read("FEATURE_INVENTORY_RESERVATIONS", base.inventoryReservations),
    promotionCodes: read("FEATURE_PROMOTION_CODES", base.promotionCodes),
    verbosePriceBreakdown: read("FEATURE_VERBOSE_BREAKDOWN", base.verbosePriceBreakdown),
  };
}
