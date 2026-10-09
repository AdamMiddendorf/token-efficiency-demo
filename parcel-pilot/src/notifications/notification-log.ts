import type { DeliveryOutcome } from "./email-client";

export interface NotificationAttemptRecord {
  notificationId: string;
  orderId: string;
  attempt: number;
  outcome: DeliveryOutcome;
  at: string;
}

/**
 * Append-only record of every delivery attempt. Deliberately holds no message
 * body and no recipient address: this log is for answering "how many times did
 * we try, and what happened", not for reconstructing the email.
 */
export class NotificationLog {
  private readonly records: NotificationAttemptRecord[] = [];

  append(record: NotificationAttemptRecord): void {
    this.records.push(record);
  }

  forOrder(orderId: string): readonly NotificationAttemptRecord[] {
    return this.records.filter((record) => record.orderId === orderId);
  }

  attemptCount(orderId: string): number {
    return this.forOrder(orderId).length;
  }

  all(): readonly NotificationAttemptRecord[] {
    return [...this.records];
  }
}
