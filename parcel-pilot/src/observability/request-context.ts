import type { IdGenerator } from "../shared/id";
import type { Logger } from "./logger";
import type { MetricsRegistry } from "./metrics";

/**
 * Per-request dependencies, passed explicitly rather than held in global or
 * async-local state. Every handler receives one of these.
 */
export interface RequestContext {
  requestId: string;
  logger: Logger;
  metrics: MetricsRegistry;
  startedAt: number;
}

export function createRequestContext(options: {
  ids: IdGenerator;
  logger: Logger;
  metrics: MetricsRegistry;
  now?: () => number;
}): RequestContext {
  const requestId = options.ids.next("req");
  return {
    requestId,
    logger: options.logger.child({ requestId }),
    metrics: options.metrics,
    startedAt: (options.now ?? Date.now)(),
  };
}
