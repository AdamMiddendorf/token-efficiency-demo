import { describe, expect, it } from "vitest";
import { defaultAppConfig, loadConfig } from "../../src/config/app-config";
import { flagsFromEnv } from "../../src/config/feature-flags";

describe("loadConfig", () => {
  it("falls back to defaults for an empty environment", () => {
    expect(loadConfig({})).toEqual(defaultAppConfig);
  });

  it("reads known values from the environment", () => {
    const config = loadConfig({ NODE_ENV: "production", CURRENCY: "EUR", LOG_LEVEL: "warn" });

    expect(config.environment).toBe("production");
    expect(config.currency).toBe("EUR");
    expect(config.logLevel).toBe("warn");
  });

  it("ignores values outside the allowed set", () => {
    const config = loadConfig({ NODE_ENV: "staging", LOG_LEVEL: "verbose" });

    expect(config.environment).toBe("development");
    expect(config.logLevel).toBe("info");
  });
});

describe("flagsFromEnv", () => {
  it("accepts 1 and true", () => {
    expect(flagsFromEnv({ FEATURE_VERBOSE_BREAKDOWN: "1" }).verbosePriceBreakdown).toBe(true);
    expect(flagsFromEnv({ FEATURE_VERBOSE_BREAKDOWN: "TRUE" }).verbosePriceBreakdown).toBe(true);
  });

  it("treats anything else as off", () => {
    expect(flagsFromEnv({ FEATURE_ORDER_EVENTS: "no" }).orderEvents).toBe(false);
  });
});
