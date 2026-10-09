# ADR 003 — Notification retry semantics

**Status:** accepted (2024-09)

## Context

"Retries" was used inconsistently: some code counted total deliveries, some
counted deliveries after the first. An incident in August 2024 doubled the
intended delivery volume because of that ambiguity.

## Decision

- The first delivery is **attempt 1**. It is not a retry.
- A **retry** is any attempt after the first.
- Therefore: `total attempts = 1 + retries`. Two retries means three attempts.
- A specification that says "N retries" always means N attempts *after* the
  initial one.
- Only transient failures are retried. Permanent failures (invalid address,
  rejected recipient) are never retried. Successful deliveries are never
  retried.

## Consequences

- Any constant controlling this behaviour must make clear which quantity it
  holds. Prefer `MAX_RETRIES` with an explicit
  `maxAttempts = 1 + MAX_RETRIES` over a single ambiguous number.
- `shouldRetry(attemptNumber, outcome)` in
  `src/notifications/retry-policy.ts` takes a 1-based attempt number.
- Changing this limit is a business-rule change: update this ADR with it.
