import type { ProductCatalog } from "../catalog/product-catalog";
import { SHIPPING_METHODS } from "../shipping/shipping-method";
import type { Order } from "./order";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface OrderValidationOptions {
  catalog?: ProductCatalog;
}

/**
 * Structural and referential checks on an order. Returns every problem found
 * rather than throwing on the first, so an API client can fix them in one go.
 *
 * Pricing rules are not validated here: whether a discount is *allowed* is a
 * pricing-policy question, not a request-shape question.
 */
export function validateOrder(order: Order, options: OrderValidationOptions = {}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (order.lines.length === 0) {
    issues.push({ field: "lines", message: "An order must contain at least one line" });
  }

  order.lines.forEach((line, index) => {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      issues.push({
        field: `lines[${index}].quantity`,
        message: "Order line quantities must be greater than zero",
      });
    }
    if (!Number.isInteger(line.unitPrice) || line.unitPrice < 0) {
      issues.push({
        field: `lines[${index}].unitPrice`,
        message: "Unit prices must be a whole number of minor units",
      });
    }
    if (options.catalog && !options.catalog.find(line.sku)) {
      issues.push({ field: `lines[${index}].sku`, message: `Unknown SKU ${line.sku}` });
    }
  });

  if (!SHIPPING_METHODS.includes(order.shippingMethod)) {
    issues.push({ field: "shippingMethod", message: "Unsupported shipping method" });
  }

  if (!/^[A-Za-z]{2}$/.test(order.countryCode)) {
    issues.push({ field: "countryCode", message: "countryCode must be a two-letter country code" });
  }

  if (order.discountPercent !== undefined) {
    if (order.discountPercent < 0 || order.discountPercent > 100) {
      issues.push({ field: "discountPercent", message: "discountPercent must be between 0 and 100" });
    }
  }

  return issues;
}
