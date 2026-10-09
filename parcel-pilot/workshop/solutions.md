# Reference solutions (facilitator only)

Do not share before the retrospective. Each solution is the *minimum* correct
change; participants may reach an equally good variant.

---

## Task 1 — discounted-order tax

One line, in `src/pricing/calculate-order-total.ts`:

```diff
-  const taxableAmount = subtotal + shipping;
+  const taxableAmount = discountedMerchandiseSubtotal + shipping;
```

No other file needs to change. In particular `src/pricing/tax-calculator.ts` is
correct: it taxes the amount it is given. Deciding *which* amount is taxable is
the pipeline's job (ADR 002).

**Watch for:** changing the tax rate; moving the discount into
`calculateTax`; editing `archive/old-tax-calculator.ts`; adding a
`discount` parameter to `calculateTax` (works, but spreads the operation order
across two modules).

---

## Task 2 — wholesale discount cap

`src/pricing/pricing-policy.ts`:

```diff
 export interface PricingPolicy {
   standardShippingMinorUnits: number;
   expressShippingMinorUnits: number;
+  /** Maximum discount a wholesale customer may receive, in minor units. */
+  wholesaleDiscountCapMinorUnits: number;
 }

 export const defaultPricingPolicy: PricingPolicy = {
   standardShippingMinorUnits: 500,
   expressShippingMinorUnits: 1500,
+  wholesaleDiscountCapMinorUnits: 50_000,
 };
```

`src/pricing/apply-discount.ts`:

```diff
-  void policy;
   const percent = input.discountPercent ?? 0;
 ...
-  return percentOf(input.subtotal, percent);
+  const discount = percentOf(input.subtotal, percent);
+
+  // The cap is a wholesale policy, not a global limit: retail discounts are
+  // uncapped by design.
+  if (input.customerTier === "wholesale") {
+    return Math.min(discount, policy.wholesaleDiscountCapMinorUnits);
+  }
+  return discount;
```

Plus cases below, at and above the cap in
`tests/pricing/wholesale-discount.test.ts`.

**Watch for:** a global cap (the common failure — retail £600 must stay £600);
the cap added to `src/promotions/promotion-engine.ts` next to
`MAX_CAMPAIGN_PERCENT` (percent, not money); the literal `50000` inline instead
of in the policy; the cap applied in `calculateOrderTotal` instead of
`applyDiscount`; floats; an edited test.

---

## Task 3 — free standard shipping

`src/pricing/pricing-policy.ts`:

```diff
+  /** Standard shipping is free at or above this discounted subtotal. */
+  freeStandardShippingThresholdMinorUnits: number;
...
+  freeStandardShippingThresholdMinorUnits: 10_000,
```

`src/pricing/shipping-price.ts`:

```diff
-  return input.method === "express"
-    ? policy.expressShippingMinorUnits
-    : policy.standardShippingMinorUnits;
+  if (input.method === "express") {
+    return policy.expressShippingMinorUnits;
+  }
+  return input.discountedMerchandiseSubtotal >= policy.freeStandardShippingThresholdMinorUnits
+    ? 0
+    : policy.standardShippingMinorUnits;
```

`calculateOrderTotal` already passes `discountedMerchandiseSubtotal`, so no
change is needed there — spotting that is the exercise.

**Watch for:** the threshold checked against the pre-discount subtotal; express
made free; the logic added to `src/shipping/shipping-selector.ts` or
`src/shipping/carrier-rates.ts`; `>` instead of `>=` (the £100 boundary case).

---

## Task 4 — two retries

`src/notifications/retry-policy.ts`:

```diff
-// Give up after this many delivery attempts.
-const maxRetries = 4;
+// A retry is an attempt after the initial one: see ADR 003.
+const MAX_RETRIES = 2;
+const maxAttempts = 1 + MAX_RETRIES;
...
-  return attemptNumber < maxRetries;
+  return attemptNumber < maxAttempts;
...
-  return maxRetries;
+  return maxAttempts;
```

`tests/notifications/retry-policy.test.ts` must be updated deliberately:

```diff
     expect(shouldRetry(2, "transient-failure")).toBe(true);
-    expect(shouldRetry(3, "transient-failure")).toBe(true);
-    expect(shouldRetry(4, "transient-failure")).toBe(false);
+    expect(shouldRetry(3, "transient-failure")).toBe(false);
...
-    expect(maxDeliveryAttempts()).toBe(4);
+    expect(maxDeliveryAttempts()).toBe(3);
```

**Watch for:** `const maxRetries = 2` (one retry — the trap); deleting the test
instead of updating it; renaming `maxDeliveryAttempts` (`delivery-queue.ts` and
two test files call it); editing `delivery-queue.ts` instead of the policy;
touching pricing code.

`tests/notifications/delivery-queue.test.ts` and
`tests/notifications/notification-service.test.ts` derive their expectations
from `maxDeliveryAttempts()`, so a correct fix leaves them green. That is the
point: a limit should have exactly one home.

---

## Task 6 — classification answers

| Discovery | Where it belongs |
|---|---|
| Money uses integer minor units | Always-loaded, one line (already there) |
| Pricing operation order | Scoped pricing rule + ADR 002 |
| The wholesale cap is £500 | `pricing-policy.ts` + tests + an ADR |
| Task 1 took three prompts | Nowhere |
| Retries exclude the initial attempt | Scoped notifications rule + ADR 003 |
| `archive/` is historical only | Always-loaded, one line (already there) |
| Exact files changed today | Git history or a handoff |
| Focused pricing test command | Scoped pricing rule / `docs/testing.md` |

The point of the five-line budget: almost everything worth keeping has a
narrower home than the always-loaded file.

---

## Full verification

```bash
npm test
npm run typecheck
npm run verify:all
```

With all four tasks solved, `npm test` is green and all four verification files
pass.
