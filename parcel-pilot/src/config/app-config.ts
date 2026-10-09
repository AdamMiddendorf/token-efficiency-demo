import { type FeatureFlags, flagsFromEnv } from "./feature-flags";

export type Environment = "development" | "test" | "production";

export interface AppConfig {
  environment: Environment;
  /** ISO 4217 code used for formatting. Pricing itself is currency-agnostic. */
  currency: string;
  defaultCountryCode: string;
  logLevel: "debug" | "info" | "warn" | "error";
  features: FeatureFlags;
}

export const defaultAppConfig: AppConfig = {
  environment: "development",
  currency: "GBP",
  defaultCountryCode: "GB",
  logLevel: "info",
  features: flagsFromEnv({}),
};

const ENVIRONMENTS: readonly Environment[] = ["development", "test", "production"];
const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

/**
 * Builds configuration from the environment. This is the only place in the
 * repository that reads `process.env`; everything else receives an AppConfig.
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const environment = ENVIRONMENTS.find((candidate) => candidate === env.NODE_ENV);
  const logLevel = LOG_LEVELS.find((candidate) => candidate === env.LOG_LEVEL);

  return {
    environment: environment ?? defaultAppConfig.environment,
    currency: env.CURRENCY ?? defaultAppConfig.currency,
    defaultCountryCode: env.DEFAULT_COUNTRY ?? defaultAppConfig.defaultCountryCode,
    logLevel: logLevel ?? defaultAppConfig.logLevel,
    features: flagsFromEnv(env),
  };
}
