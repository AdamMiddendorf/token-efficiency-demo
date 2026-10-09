# Parcel Pilot

A TypeScript order-pricing and fulfilment service. It quotes and prices orders,
resolves promotion codes, reserves stock, stores orders, and sends fulfilment
notifications with a retry policy.

Everything runs in process: there is no database, no network listener and no
third-party service. The HTTP layer is a transport-agnostic request dispatcher,
so the whole API is exercised in tests.

This repository is the working material for the **Token-Efficient AI
Development Workshop** (60 minutes). Start with
[`workshop/participant-guide.md`](workshop/participant-guide.md).

## Quick start

```bash
npm install
npm test
npm run typecheck
npm run lint
```

The suite is ~120 tests and runs in about a second. On a fresh checkout
**one test fails by design** — that failure is the starting point of Task 1.

## Layout

```text
src/
  app/            composition root (build-app.ts)
  http/           router, request parsing, error mapping
  api/            endpoint handlers and public response shapes
  orders/         order lifecycle, validation, domain events
  pricing/        money: totals, discounts, tax, shipping price, formatting
  promotions/     campaign codes and eligibility
  inventory/      stock levels and reservations
  catalog/        products and weights
  shipping/       method selection, zones, carrier costs, delivery estimates
  notifications/  delivery, retry policy, queue, audit log
  customers/      customer identity and tier
  config/         configuration and feature flags
  observability/  structured logging and metrics
  shared/         Result, errors, Clock, ids, assertions
tests/            the normal test suite, mirroring src/
docs/             architecture, glossary, testing notes, decision records
verify/           facilitator verification suite (not part of `npm test`)
workshop/         guides, tasks, prompt canvas, scorecard
archive/          retired code - not current, not compiled, not tested
fixtures/         sample data, plus one large analytics export
```

## Business rules that matter

- Money is integer minor units (£114.00 is `11400`).
- Discounts are applied before tax; shipping is taxable.
- Retail and wholesale customers can have different discount policies.
- Promotions decide a percentage; pricing decides what it is worth.
- A retry is an attempt *after* the initial one.
- Public API response types stay backward-compatible.

## Where to look

`docs/architecture.md` has a routing table from concern to file, and a list of
modules whose names suggest a job they do not do. `docs/decisions/` has the
reasoning behind each business rule. `docs/domain-glossary.md` defines the
terms — including the ones that are ambiguous in a specification.
