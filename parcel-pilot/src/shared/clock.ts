export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Deterministic clock for tests. */
export function fixedClock(isoTimestamp: string): Clock {
  const instant = new Date(isoTimestamp);
  return { now: () => new Date(instant) };
}
