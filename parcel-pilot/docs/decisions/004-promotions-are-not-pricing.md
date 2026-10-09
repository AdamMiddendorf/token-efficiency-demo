# ADR 004 — Promotions decide percentages, pricing decides money

**Status:** accepted (2025-02)

## Context

Campaign codes arrived after the pricing pipeline was already in place. The
first implementation let a campaign specify a monetary discount directly, and
within two months there were three places that could reduce an order total: the
campaign definition, the pricing pipeline, and an API handler. Reconciling a
customer's total against the finance ledger required reading all three.

## Decision

The boundary is drawn at the unit:

- **Promotions work in percentages.** `src/promotions/` decides *whether* a
  submitted code applies to an order and *what percentage* it grants. It
  validates eligibility: expiry, minimum subtotal, customer tier, active flag.
- **Pricing works in money.** `src/pricing/` decides what a percentage is
  worth, and enforces every monetary rule — caps, floors, rounding, order of
  operations.

`MAX_CAMPAIGN_PERCENT` in `promotion-engine.ts` is a guard against a
mis-configured campaign and is expressed as a percentage. It is not a monetary
cap, and a percentage below it can still produce a large discount on a large
order.

An invalid or ineligible code is not an error. The order is priced without it
and the reason is logged.

## Consequences

- `calculateOrderTotal` never sees a promotion code, only a `discountPercent`.
- A monetary limit on discounts belongs in `src/pricing/pricing-policy.ts`,
  never in a campaign definition or an API handler.
- Adding a campaign is a data change. Changing what a discount is worth is a
  pricing change, and needs a decision record.
