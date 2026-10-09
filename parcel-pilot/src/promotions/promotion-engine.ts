import type { CustomerTier } from "../customers/customer-tier";
import { type Clock, systemClock } from "../shared/clock";
import { findPromotion } from "./promo-code";
import type { PromotionOutcome } from "./promotion";

/**
 * The largest percentage any campaign may ever grant. This is a guard against
 * a mis-configured campaign, expressed as a **percentage**.
 *
 * It is not a limit on the monetary value of a discount: a 15% discount on a
 * large order can still be a large amount of money. Monetary caps live in
 * `src/pricing/pricing-policy.ts`.
 */
export const MAX_CAMPAIGN_PERCENT = 25;

export interface PromotionRequest {
  code: string;
  customerTier: CustomerTier;
  /** Merchandise subtotal before any discount, in minor units. */
  subtotal: number;
}

export class PromotionEngine {
  private readonly clock: Clock;

  constructor(clock: Clock = systemClock) {
    this.clock = clock;
  }

  /**
   * Resolves a submitted code to the percentage it grants, or explains why it
   * does not apply. The caller passes the percentage into the pricing
   * pipeline; this engine never touches money.
   */
  resolve(request: PromotionRequest): PromotionOutcome {
    const promotion = findPromotion(request.code);
    if (!promotion) {
      return { applied: false, reason: "unknown-code" };
    }
    if (!promotion.active) {
      return { applied: false, reason: "inactive" };
    }

    const now = this.clock.now().getTime();
    if (now < new Date(promotion.startsAt).getTime()) {
      return { applied: false, reason: "not-yet-started" };
    }
    if (now > new Date(promotion.endsAt).getTime()) {
      return { applied: false, reason: "expired" };
    }
    if (request.subtotal < promotion.minimumSubtotalMinorUnits) {
      return { applied: false, reason: "below-minimum-subtotal" };
    }
    if (
      promotion.eligibleTiers.length > 0 &&
      !promotion.eligibleTiers.includes(request.customerTier)
    ) {
      return { applied: false, reason: "tier-not-eligible" };
    }

    return {
      applied: true,
      promotion,
      percentOff: Math.min(promotion.percentOff, MAX_CAMPAIGN_PERCENT),
    };
  }
}
