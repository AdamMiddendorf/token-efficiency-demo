/**
 * Identifier generation. Centralised so that every entity gets a prefixed,
 * sortable, human-readable id, and so tests can substitute a deterministic
 * generator instead of patching globals.
 */
export type IdPrefix = "ord" | "cus" | "rsv" | "ntf" | "req";

export interface IdGenerator {
  next(prefix: IdPrefix): string;
}

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

function encode(value: number, length: number): string {
  let out = "";
  let remaining = value;
  for (let i = 0; i < length; i += 1) {
    out = ALPHABET[remaining % ALPHABET.length] + out;
    remaining = Math.floor(remaining / ALPHABET.length);
  }
  return out;
}

/** Time-ordered ids: a millisecond timestamp followed by a random suffix. */
export class TimestampIdGenerator implements IdGenerator {
  private readonly random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  next(prefix: IdPrefix): string {
    const time = encode(Date.now(), 8);
    const suffix = encode(Math.floor(this.random() * 1_048_576), 4);
    return `${prefix}_${time}${suffix}`;
  }
}

/** Predictable ids for tests: `ord_000001`, `ord_000002`, ... */
export class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<IdPrefix, number>();

  next(prefix: IdPrefix): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}_${String(n).padStart(6, "0")}`;
  }
}
