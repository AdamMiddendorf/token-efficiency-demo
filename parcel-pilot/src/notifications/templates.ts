import type { Customer } from "../customers/customer";
import type { OrderRecord } from "../orders/order";
import { formatMoney } from "../pricing/currency";
import type { EmailMessage } from "./email-client";

export function orderConfirmationTemplate(
  customer: Customer,
  record: OrderRecord,
): EmailMessage {
  const lines = [
    `Hello ${customer.name},`,
    "",
    `We have received order ${record.id}.`,
    `Merchandise: ${formatMoney(record.total.subtotal - record.total.discount)}`,
    `Shipping: ${formatMoney(record.total.shipping)}`,
    `Tax: ${formatMoney(record.total.tax)}`,
    `Total: ${formatMoney(record.total.total)}`,
    "",
    "Parcel Pilot",
  ];

  return {
    to: customer.email,
    subject: `Your Parcel Pilot order ${record.id}`,
    body: lines.join("\n"),
  };
}
