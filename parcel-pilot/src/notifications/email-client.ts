export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export type DeliveryOutcome = "delivered" | "transient-failure" | "permanent-failure";

export interface EmailClient {
  send(message: EmailMessage): Promise<DeliveryOutcome>;
}

/**
 * Test double that replays a fixed sequence of outcomes, then succeeds.
 * There is no real email provider in this repository.
 */
export class ScriptedEmailClient implements EmailClient {
  readonly sent: EmailMessage[] = [];
  private readonly outcomes: DeliveryOutcome[];

  constructor(outcomes: DeliveryOutcome[] = []) {
    this.outcomes = outcomes;
  }

  async send(message: EmailMessage): Promise<DeliveryOutcome> {
    const outcome = this.outcomes[this.sent.length] ?? "delivered";
    this.sent.push(message);
    return outcome;
  }

  get attempts(): number {
    return this.sent.length;
  }
}
