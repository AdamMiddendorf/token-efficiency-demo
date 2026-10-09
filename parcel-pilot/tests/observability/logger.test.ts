import { describe, expect, it } from "vitest";
import { RecordingLogger, StructuredLogger, redact } from "../../src/observability/logger";

describe("redact", () => {
  it("masks personal and secret fields", () => {
    expect(redact({ email: "dana@example.test", orderId: "ord_1" })).toEqual({
      email: "[redacted]",
      orderId: "ord_1",
    });
  });

  it("masks nested fields", () => {
    expect(redact({ customer: { name: "Dana", email: "dana@example.test" } })).toEqual({
      customer: { name: "Dana", email: "[redacted]" },
    });
  });

  it("is case-insensitive about field names", () => {
    expect(redact({ Authorization: "Bearer abc" })).toEqual({ Authorization: "[redacted]" });
  });
});

describe("StructuredLogger", () => {
  it("drops records below the configured level", () => {
    const logger = new RecordingLogger("warn");

    logger.debug("ignored");
    logger.info("ignored");
    logger.warn("kept");
    logger.error("kept");

    expect(logger.records.map((record) => record.message)).toEqual(["kept", "kept"]);
  });

  it("merges child fields into every record", () => {
    const records: { fields: Record<string, unknown> }[] = [];
    const logger = new StructuredLogger({
      level: "debug",
      sink: (record) => records.push(record),
      now: () => new Date("2026-01-05T09:00:00.000Z"),
    }).child({ requestId: "req_1" });

    logger.info("handled", { status: 200 });

    expect(records[0].fields).toEqual({ requestId: "req_1", status: 200 });
  });

  it("redacts on the way out, not at the call site", () => {
    const logger = new RecordingLogger();
    logger.info("sending", { to: "dana@example.test" });

    expect(logger.records[0].fields.to).toBe("[redacted]");
  });
});
