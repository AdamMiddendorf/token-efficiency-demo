import type { Customer } from "../customers/customer";
import type { OrderRecord } from "../orders/order";
import { METRIC_NOTIFICATION_FAILED, type MetricsRegistry } from "../observability/metrics";
import { type Logger, nullLogger } from "../observability/logger";
import { type Clock, systemClock } from "../shared/clock";
import type { EmailClient } from "./email-client";
import type { NotificationLog } from "./notification-log";
import { shouldRetry } from "./retry-policy";
import { orderConfirmationTemplate } from "./templates";

export interface NotificationResult {
  delivered: boolean;
  /** Total number of delivery attempts made, including the initial attempt. */
  attempts: number;
}

export interface NotificationServiceOptions {
  clock?: Clock;
  log?: NotificationLog;
  metrics?: MetricsRegistry;
  logger?: Logger;
}

export class NotificationService {
  private readonly emailClient: EmailClient;
  private readonly clock: Clock;
  private readonly log?: NotificationLog;
  private readonly metrics?: MetricsRegistry;
  private readonly logger: Logger;

  constructor(emailClient: EmailClient, options: NotificationServiceOptions = {}) {
    this.emailClient = emailClient;
    this.clock = options.clock ?? systemClock;
    this.log = options.log;
    this.metrics = options.metrics;
    this.logger = options.logger ?? nullLogger;
  }

  /**
   * Delivers the order confirmation, retrying according to the retry policy.
   * The policy decides whether another attempt happens; this method only
   * performs the attempts and records what happened.
   */
  async sendOrderConfirmation(
    customer: Customer,
    record: OrderRecord,
  ): Promise<NotificationResult> {
    const message = orderConfirmationTemplate(customer, record);

    let attemptNumber = 0;
    for (;;) {
      attemptNumber += 1;
      const outcome = await this.emailClient.send(message);

      this.log?.append({
        notificationId: `${record.id}:${attemptNumber}`,
        orderId: record.id,
        attempt: attemptNumber,
        outcome,
        at: this.clock.now().toISOString(),
      });

      if (outcome === "delivered") {
        return { delivered: true, attempts: attemptNumber };
      }

      if (!shouldRetry(attemptNumber, outcome)) {
        this.metrics?.increment(METRIC_NOTIFICATION_FAILED, { outcome });
        this.logger.warn("order confirmation not delivered", {
          orderId: record.id,
          attempts: attemptNumber,
          outcome,
        });
        return { delivered: false, attempts: attemptNumber };
      }
    }
  }
}
