# Testing

The full suite is around 120 tests and finishes in about a second. Running the
narrowest relevant test first is still the house style: it keeps output short,
makes the failure obvious, and keeps agent context small.

## Commands

```bash
npm test                                                  # everything
npm test -- tests/pricing                                 # one area
npm test -- tests/pricing/calculate-order-total.test.ts   # one file
npm test -- -t "discounted"                               # one test by name
npm run typecheck
npm run lint
```

## Where tests live

`tests/` mirrors `src/` by area.

| Area | Tests |
|---|---|
| Pricing pipeline | `tests/pricing/calculate-order-total.test.ts` |
| Discounts | `tests/pricing/wholesale-discount.test.ts` |
| Tax | `tests/pricing/tax-calculator.test.ts` |
| Receipt lines and currency | `tests/pricing/price-breakdown.test.ts`, `tests/pricing/currency.test.ts` |
| Promotion codes | `tests/promotions/promotion-engine.test.ts` |
| Shipping selection and estimates | `tests/shipping/` |
| Stock reservation | `tests/inventory/inventory-service.test.ts` |
| Product catalogue | `tests/catalog/product-catalog.test.ts` |
| Order lifecycle, validation, events | `tests/orders/` |
| Notification retries, queue, delivery | `tests/notifications/` |
| Routing and request parsing | `tests/http/` |
| Configuration and observability | `tests/config/`, `tests/observability/` |
| Whole service, end to end | `tests/app/parcel-pilot.test.ts` |

## Conventions

- Assert on whole `OrderTotal` objects where the pipeline matters; a change in
  operation order should fail loudly rather than slip through one field.
- Money assertions use integer minor units (`11_400`, not `114.00`).
- Use the test doubles the repository already provides — `fixedClock`,
  `SequentialIdGenerator`, `ScriptedEmailClient`, `RecordingLogger`,
  `InMemoryOrderRepository` — rather than mocking modules.
- Where a test depends on a business limit, derive it from the module that owns
  the limit (for example `maxDeliveryAttempts()`) instead of hard-coding the
  number in a second place.
- Never weaken an existing test to make a change pass. If a test encodes the
  wrong behaviour, change it deliberately and say so.
- `verify/` holds the facilitator verification suite for the workshop. It is
  not part of `npm test`; run it with `npm run verify:all`.
