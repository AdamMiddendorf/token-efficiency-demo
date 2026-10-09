# Task 2 — Plan before implementing (12 minutes)

Same repository, opposite approach. This time you supply the context and
require a plan before any edit.

## The requirement

> Wholesale customers may receive percentage discounts, but the discount must
> never exceed **£500**.
>
> Retail behaviour must remain unchanged.

## How to run it

1. **Do not start editing.** Write the prompt with your pair first, in
   `workshop/prompt-canvas.md`.
2. Ask for a plan and **stop there**. Use plan/ask mode if your tool has one.
3. Read the plan. Does it name the files, the tier condition, the tests, and
   the verification command? Does it say anything that isn't in your prompt?
   If it is just a restatement, that plan cost you tokens and bought nothing.
4. Approve or correct the plan, then implement.
5. Run the narrowest relevant test.

## Starting context to give the agent

```text
- src/pricing/apply-discount.ts
- src/pricing/pricing-policy.ts
- tests/pricing/wholesale-discount.test.ts
```

Anything else it needs, it should ask for.

## Required behaviour

| Customer tier | Calculated discount | Applied discount |
|---|---:|---:|
| Retail | £600 | £600 |
| Wholesale | £400 | £400 |
| Wholesale | £500 | £500 |
| Wholesale | £600 | £500 |

The retail row is intentionally surprising. It proves the cap is a **wholesale
policy**, not a global limit. If your plan doesn't mention tiers, you will
almost certainly implement a global cap.

## The wrong place to put this

`src/promotions/promotion-engine.ts` has a constant called
`MAX_CAMPAIGN_PERCENT` and looks like the home for a discount limit. It is not:
it caps a *percentage*, and this requirement is a limit in *money*. A 15%
discount can still exceed £500 on a large order.
`docs/decisions/004-promotions-are-not-pricing.md` draws the line.

If your agent proposes a change under `src/promotions/`, that is a sign the
prompt did not say which units the rule is expressed in.

## Constraints

- Money stays in integer minor units — £500 is `50000`.
- The cap value lives in `src/pricing/pricing-policy.ts`. Do not scatter the
  literal `50000` across files.
- No pricing rules in API handlers.
- Do not refactor the pricing pipeline.
- Do not weaken existing tests. Add cases at, below and above the cap.

## Done when

```bash
npm test -- tests/pricing/wholesale-discount.test.ts
npm run typecheck
npm run verify:task-2
```

## Record

Compare against Task 1 in `workshop/scorecard.md`: files inspected, relevant
ratio, corrective turns, minutes. Note whether the plan changed the
implementation, or merely described it.

---

**Lesson:** planning is valuable when it *reduces uncertainty* and narrows the
solution space. A plan that restates the request is pure overhead.
