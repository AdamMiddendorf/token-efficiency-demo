# Architecture

Parcel Pilot prices orders, reserves stock, stores orders, and sends
fulfilment notifications. There is no database, no network listener and no
third-party service: the HTTP layer is a plain request dispatcher, so the whole
service runs in process and in tests.

## Routing table

Use this table before searching the repository.

| Concern | Primary location |
|---|---|
| Order totals (the pricing pipeline) | `src/pricing/calculate-order-total.ts` |
| Discount amounts | `src/pricing/apply-discount.ts` |
| Discount / shipping policy values | `src/pricing/pricing-policy.ts` |
| Shipping **price charged to the customer** | `src/pricing/shipping-price.ts` |
| Tax rates | `src/pricing/tax-calculator.ts` |
| Money helpers and rounding | `src/pricing/money.ts` |
| Currency formatting | `src/pricing/currency.ts` |
| Receipt lines | `src/pricing/price-breakdown.ts` |
| Promotion codes and eligibility | `src/promotions/promotion-engine.ts` |
| Shipping **method selection** | `src/shipping/shipping-selector.ts` |
| Carrier **costs to us** | `src/shipping/carrier-rates.ts` |
| Delivery date estimates | `src/shipping/delivery-estimate.ts` |
| Order lifecycle | `src/orders/order-service.ts` |
| Order request validation | `src/orders/order-validation.ts` |
| Domain events | `src/orders/order-events.ts` |
| Stock reservation | `src/inventory/inventory-service.ts` |
| Product data and weights | `src/catalog/product-catalog.ts` |
| Public API response shape | `src/api/order-response.ts` |
| Routing and request parsing | `src/http/router.ts`, `src/http/request-parsing.ts` |
| Error to HTTP status mapping | `src/http/http-errors.ts` |
| Notification delivery | `src/notifications/notification-service.ts` |
| Notification **retry decision** | `src/notifications/retry-policy.ts` |
| Notification **scheduling and backoff** | `src/notifications/delivery-queue.ts` |
| Configuration and feature flags | `src/config/app-config.ts` |
| Logging and metrics | `src/observability/` |
| Wiring everything together | `src/app/build-app.ts` |

## Pricing pipeline

```text
subtotal
  -> discount
  -> discounted merchandise subtotal
  -> shipping
  -> taxable amount
  -> tax
  -> total
```

Each arrow is one function. `calculateOrderTotal` composes them and owns the
order of operations; the individual functions do not know about each other.
See `docs/decisions/002-pricing-operation-order.md`.

## Request path

```text
HttpRequest
  -> http/router        match method + path, extract params
  -> http/request-parsing  untrusted JSON -> domain Order (unknown fields dropped)
  -> api/*-handler      one handler per endpoint
  -> orders/order-service   validate -> promotion -> reserve -> price -> save -> notify
  -> api/order-response mapping to the public response shape
```

`OrderService` owns the *order* of those steps and none of the rules
themselves. Each rule lives in its own module, which is why a change to one
rule should touch one file.

## Layering

```text
app/            composition root; the only place that constructs dependencies
http/           transport: routing, parsing, status mapping
api/            handlers and public response shapes
orders/         order lifecycle and validation
pricing/        every monetary rule
promotions/     campaign codes and eligibility
inventory/      stock reservation
catalog/        product data
shipping/       method selection, zones, carrier costs, delivery estimates
notifications/  delivery, retry decisions, queueing, audit log
customers/      customer identity and tier
config/         configuration and feature flags
observability/  structured logging and metrics
shared/         Result, errors, Clock, ids, assertions
```

Dependencies point inwards: `http` -> `api` -> `orders` -> `pricing` /
`inventory` / `notifications` -> `shared`. Nothing under `src/` imports from
`archive/` or `fixtures/`, and only `src/config/` reads `process.env`.

## Things that are not what they look like

Several modules have plausible names for jobs they do not do:

| Looks like | Actually |
|---|---|
| `src/shipping/shipping-selector.ts` | picks *which* method is used; never sets a price |
| `src/shipping/carrier-rates.ts` | what carriers charge **us**; not what the customer pays |
| `src/promotions/promotion-engine.ts` | decides *which percentage* applies; never touches money |
| `src/notifications/delivery-queue.ts` | decides *when* to try again; `retry-policy.ts` decides *whether* |
| `src/pricing/tax-calculator.ts` | taxes an amount it is given; the pipeline decides what is taxable |
| `src/pricing/price-breakdown.ts` | formats an already-computed total; recalculates nothing |
| `Product.listPrice` | the current catalogue price; orders capture their own `unitPrice` |
| `archive/` | retired code, not compiled and not tested |
| `fixtures/large-order-history.json` | an analytics export used by no test |
