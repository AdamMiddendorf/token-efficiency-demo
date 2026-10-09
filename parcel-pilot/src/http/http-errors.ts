import { OutOfStockError } from "../inventory/inventory-service";
import { DomainError, NotFoundError, ValidationError } from "../shared/errors";
import type { ErrorBody } from "../api/handler-response";

/**
 * Maps a domain error onto an HTTP status. Unrecognised errors become a 500
 * with a generic message: internal failure detail is logged, never returned,
 * so that stack traces and internal identifiers do not leak to API clients.
 */
export function statusForError(error: unknown): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof OutOfStockError) return 409;
  if (error instanceof DomainError) return 400;
  return 500;
}

export function errorBody(error: unknown): ErrorBody {
  if (error instanceof DomainError) {
    return { error: error.message, code: error.code };
  }
  return { error: "Internal server error", code: "INTERNAL" };
}
