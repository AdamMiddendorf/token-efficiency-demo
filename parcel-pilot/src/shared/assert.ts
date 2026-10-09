import { ValidationError } from "./errors";

/** Narrowing assertion that raises a domain-level validation error. */
export function assertDefined<T>(value: T | null | undefined, label: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(`${label} is required`);
  }
}

export function assertNonEmpty<T>(values: readonly T[], label: string): void {
  if (values.length === 0) {
    throw new ValidationError(`${label} must not be empty`);
  }
}

export function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${label} must be a positive integer, received ${value}`);
  }
}

export function assertOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new ValidationError(`${label} must be one of ${allowed.join(", ")}, received ${value}`);
  }
}
