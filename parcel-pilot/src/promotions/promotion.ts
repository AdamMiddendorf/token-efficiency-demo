import type { CustomerTier } from "../customers/customer-tier";

/**
 * A marketing campaign. Promotions decide **whether** a percentage applies to
 * an order and **what percentage** that is.
 *
 * They do not decide what the percentage is worth in money, and they do not
 * enforce monetary limits on the resulting discount — that belongs to
 * `src/pricing/`. See docs/decisions/004-promotions-are-not-pricing.md.
 */
export interface Promotion {
  code: string;
  description: string;
  percentOff: number;
  /** Minimum merchandise subtotal, in minor units, for the code to apply. */
  minimumSubtotalMinorUnits: number;
  /** Tiers the campaign is offered to. Empty means every tier. */
  eligibleTiers: readonly CustomerTier[];
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export type PromotionRejectionReason =
  | "unknown-code"
  | "inactive"
  | "expired"
  | "not-yet-started"
  | "below-minimum-subtotal"
  | "tier-not-eligible";

export type PromotionOutcome =
  | { applied: true; promotion: Promotion; percentOff: number }
  | { applied: false; reason: PromotionRejectionReason };
