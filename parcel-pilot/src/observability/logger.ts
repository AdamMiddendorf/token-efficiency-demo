export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

export interface LogRecord {
  level: LogLevel;
  message: string;
  fields: LogFields;
  timestamp: string;
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/**
 * Field names whose values are replaced before a record leaves the process.
 * Customer email addresses are personal data and must not reach log storage;
 * secrets must never be logged at all.
 */
const REDACTED_FIELDS = new Set([
  "email",
  "emailaddress",
  "to",
  "recipient",
  "password",
  "token",
  "apikey",
  "authorization",
  "secret",
]);

export function redact(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (REDACTED_FIELDS.has(key.toLowerCase())) {
      out[key] = "[redacted]";
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redact(value as LogFields);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export interface LoggerOptions {
  level?: LogLevel;
  sink?: (record: LogRecord) => void;
  now?: () => Date;
  base?: LogFields;
}

export class StructuredLogger implements Logger {
  private readonly level: LogLevel;
  private readonly sink: (record: LogRecord) => void;
  private readonly now: () => Date;
  private readonly base: LogFields;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? "info";
    this.sink = options.sink ?? ((record) => console.log(JSON.stringify(record)));
    this.now = options.now ?? (() => new Date());
    this.base = options.base ?? {};
  }

  child(fields: LogFields): Logger {
    return new StructuredLogger({
      level: this.level,
      sink: this.sink,
      now: this.now,
      base: { ...this.base, ...fields },
    });
  }

  debug(message: string, fields: LogFields = {}): void {
    this.write("debug", message, fields);
  }

  info(message: string, fields: LogFields = {}): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields: LogFields = {}): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields: LogFields = {}): void {
    this.write("error", message, fields);
  }

  private write(level: LogLevel, message: string, fields: LogFields): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) {
      return;
    }
    this.sink({
      level,
      message,
      fields: redact({ ...this.base, ...fields }),
      timestamp: this.now().toISOString(),
    });
  }
}

/** Collects records in memory. Used by tests and by the local dev harness. */
export class RecordingLogger extends StructuredLogger {
  readonly records: LogRecord[] = [];

  constructor(level: LogLevel = "debug") {
    const records: LogRecord[] = [];
    super({ level, sink: (record) => records.push(record) });
    this.records = records;
  }
}

export const nullLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => nullLogger,
};
