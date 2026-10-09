export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
