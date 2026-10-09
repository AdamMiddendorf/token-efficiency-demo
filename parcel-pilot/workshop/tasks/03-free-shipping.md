# Task 3 — Surgical context (optional / homework, 15 minutes)

No file names this time. Route yourself with `docs/architecture.md` instead of
letting the agent scan the repository.

## The requirement

> Standard shipping is free when the discounted merchandise subtotal is at
> least **£100**. Express shipping is never free.

## How to run it

1. Open `docs/architecture.md` yourself and read the routing table. Thirty
   seconds of your own reading replaces a repository-wide search.
2. Decide the **smallest** set of files that can possibly be involved. Write
   the list down before prompting.
3. Write the prompt, ask for a short plan, then implement.

## The ambiguity that matters

"Order value" is not specific enough to implement. The threshold applies to the
merchandise subtotal **after discount** and **before shipping and tax**. If your
prompt says "order value", expect to get one of the other three readings.

## Acceptance cases

| Discounted merchandise subtotal | Method | Shipping charge |
|---:|---|---:|
| £99.99 | Standard | £5 |
| £100 | Standard | £0 |
| £150 | Standard | £0 |
| £150 | Express | £15 |

Plus: £120 merchandise with a 20% discount is £96 discounted — shipping is
still charged.

## Three plausible wrong turns

`src/shipping/` contains two files that sound exactly right and are exactly
wrong:

- `shipping-selector.ts` selects *which* method is used. It never prices it.
- `carrier-rates.ts` holds what carriers charge **us**. Changing it alters
  margin reporting, not the customer's bill.

And `src/pricing/price-breakdown.ts` renders the shipping line on a receipt —
it formats a number that has already been decided elsewhere.

The file that decides what the customer pays for shipping is
`src/pricing/shipping-price.ts`. The routing table in `docs/architecture.md`
says so in one line.

## Constraints

- Threshold value belongs in `src/pricing/pricing-policy.ts` as `10000`.
- Do not modify shipping-method selection.
- Integer minor units throughout; free shipping is `0`, taxed as `0`.

## Done when

```bash
npm test -- tests/pricing
npm run typecheck
npm run verify:task-3
```

---

**Lesson:** a small navigation document saves more context than a large
always-loaded instruction file.
