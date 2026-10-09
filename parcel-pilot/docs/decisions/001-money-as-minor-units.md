# ADR 001 — Money is stored as integer minor units

**Status:** accepted (2024-03)

## Context

Version 1 stored money as floating-point pounds (`archive/pricing-v1.ts`).
Rounding drift produced totals that were off by one penny on roughly 1 in 400
discounted orders, and the errors accumulated in month-end reporting.

## Decision

All monetary values in `src/` are integers in the currency's minor unit
(pence, cents). £114.00 is `11400`.

- Conversion to a display string happens once, at the edge:
  `formatMinorUnits()` in `src/pricing/money.ts`.
- Percentages are applied with `percentOf()`, which rounds to the nearest minor
  unit. Percentages themselves may be fractional (e.g. `12.5`).
- No `float` arithmetic on money, and no currency libraries.

## Consequences

- Every amount crossing a module boundary is an integer.
- Tests assert integer amounts, and the pipeline tests check that every field of
  `OrderTotal` is an integer.
- Introducing a float into a money path is a defect, not a style preference.
