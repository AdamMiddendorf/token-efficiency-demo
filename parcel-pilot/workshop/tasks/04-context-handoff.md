# Task 4 — The goal changes (10 minutes)

The subsystem changes from pricing to notifications. The decision you make
*before* prompting is the exercise.

## Step 1 — Decide, and write it down (2 minutes, before you type)

| Question | Your answer |
|---|---|
| Is this the same goal, or a new one? | |
| Which of my current context is still useful? | |
| Will I continue / compact / clear / open a fresh chat? | |
| What does the new session need to be given? | |

Then do it. Notice what your instinct was, and whether you overrode it.

## Step 2 — The requirement

> Failed fulfilment notification deliveries currently allow **three** retries.
> Change the maximum to **two** retries.
>
> Do not change pricing code.

## Relevant files

```text
- src/notifications/retry-policy.ts
- tests/notifications/retry-policy.test.ts
- docs/decisions/003-notification-retries.md
```

## Two neighbours that are not the answer

`src/notifications/delivery-queue.ts` has a `BACKOFF_SECONDS` table and talks
about attempts and dead-lettering. It decides *when* the next attempt happens;
`retry-policy.ts` decides *whether* there is one. The queue already defers to
the policy, so changing the policy is enough — and changing the queue instead
leaves the real limit untouched.

`src/notifications/notification-log.ts` records attempts after the fact. It
changes nothing.

## Read this before changing a number

"Two retries" means:

```text
initial attempt + retry 1 + retry 2 = three attempts in total
```

The current implementation does not make that distinction obvious. Changing the
existing constant to `2` gives you **one** retry, not two. A clearer shape:

```ts
const MAX_RETRIES = 2;
const maxAttempts = 1 + MAX_RETRIES;
```

## Acceptance cases

- Attempt 1 may be retried.
- Attempt 2 may be retried.
- Attempt 3 may **not** be retried.
- Successful deliveries are never retried.
- Permanent failures are never retried.
- `maxDeliveryAttempts()` reports `3`.

`tests/notifications/retry-policy.test.ts` encodes the *old* limit. Update it
deliberately — do not delete it, and do not loosen the assertions.

## Done when

```bash
npm test -- tests/notifications/retry-policy.test.ts
npm run typecheck
npm run verify:task-4
```

## Record

- Did carrying (or dropping) the pricing context help or hurt?
- Which durable state did the fresh session rely on — code, tests, or docs?
- How long did it take to get productive again after clearing?

---

**Lesson:** clearing context is not losing engineering work. Code, tests,
documentation and version history are the durable memory; the transcript is
scaffolding.
