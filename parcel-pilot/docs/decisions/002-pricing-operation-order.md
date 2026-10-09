# ADR 002 — Pricing operation order

**Status:** accepted (2024-05)

## Context

Discounts, shipping and tax can legitimately be combined in several orders, and
different orders produce different totals. Finance and the tax advisor needed
one fixed answer.

## Decision

The pricing pipeline is fixed as:

```text
1. subtotal            sum of unitPrice * quantity
2. discount            calculated from the subtotal
3. discounted subtotal subtotal - discount
4. shipping            charged on top of the discounted subtotal
5. taxable amount      discounted subtotal + shipping
6. tax                 tax rate applied to the taxable amount
7. total               discounted subtotal + shipping + tax
```

Two consequences are easy to get wrong:

- **Discounts are applied before tax.** Tax is never charged on the
  pre-discount subtotal. A customer with a discount pays less tax.
- **Shipping is taxable.** It is inside the taxable amount, not added after tax.

## Worked example

£100 merchandise, 10% discount, £5 standard shipping, 20% UK tax:

```text
subtotal              10000
discount               1000
discounted subtotal    9000
shipping                500
taxable amount         9500
tax                    1900
total                 11400
```

## Consequences

`calculateOrderTotal` owns this order. Individual functions
(`applyDiscount`, `shippingPriceFor`, `calculateTax`) must not re-derive it.
