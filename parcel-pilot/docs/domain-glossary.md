# Domain glossary

**Minor units** — the integer currency representation used everywhere in
`src/`. £1.00 is `100`. See `docs/decisions/001-money-as-minor-units.md`.

**Merchandise subtotal** — the sum of `unitPrice * quantity` across order lines,
before discount, shipping and tax.

**Discounted merchandise subtotal** — merchandise subtotal minus discount.
Excludes shipping and tax. This is the figure most business rules refer to when
they say "order value"; "order value" on its own is ambiguous and should not be
used in a specification.

**Taxable amount** — discounted merchandise subtotal plus shipping. Shipping is
taxable.

**Total** — discounted merchandise subtotal + shipping + tax.

**Customer tier** — `retail` or `wholesale`. Tiers may have different discount
policies. A rule that applies to one tier is not automatically global.

**Shipping method** — `standard` or `express`. *Selection* (which method is
used) and *price* (what it costs) are separate concerns.

**Attempt** — one delivery of a notification. The first delivery is attempt 1.

**Retry** — any attempt after the first. Two retries means three attempts in
total.

**Promotion / campaign code** — a marketing code that grants a *percentage*.
It never specifies an amount of money. See
`docs/decisions/004-promotions-are-not-pricing.md`.

**Reservation** — a promise of stock against an order. Reserving does not move
stock; stock leaves on `consume` and returns on `release`.

**List price** — the catalogue price of a product today. An order line captures
its own `unitPrice` when placed, so a catalogue change never reprices an
existing order.

**Carrier cost** — what a carrier charges *us*. Not what the customer pays.

**Dead letter** — a notification that the retry policy has given up on.

**Transient failure** — a failure that may succeed later; retryable.

**Permanent failure** — e.g. an invalid address; never retried.
