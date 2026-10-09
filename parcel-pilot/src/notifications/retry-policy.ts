import type { DeliveryOutcome } from "./email-client";

// Give up after this many delivery attempts.
const maxRetries = 4;

/**
 * Decides whether another delivery should be made after `attemptNumber`
 * attempts have already happened. `attemptNumber` is 1-based: the initial
 * delivery attempt is attempt 1.
 *
 * See docs/decisions/003-notification-retries.md.
 */
export function shouldRetry(attemptNumber: number, outcome: DeliveryOutcome): boolean {
  if (outcome !== "transient-failure") {
    return false;
  }
  return attemptNumber < maxRetries;
}

/** Total number of delivery attempts allowed, including the initial attempt. */
export function maxDeliveryAttempts(): number {
  return maxRetries;
}
