import type { Order, OrderLine } from "../orders/order";
import type { CustomerTier } from "../customers/customer-tier";
import type { ShippingMethod } from "../shipping/shipping-method";
import { ValidationError } from "../shared/errors";
import { err, ok, type Result } from "../shared/result";

export interface CreateOrderRequest {
  customerId: string;
  order: Order;
}

const TIERS: readonly CustomerTier[] = ["retail", "wholesale"];
const METHODS: readonly ShippingMethod[] = ["standard", "express"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLines(value: unknown): OrderLine[] {
  if (!Array.isArray(value)) {
    throw new ValidationError("lines must be an array");
  }

  return value.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new ValidationError(`lines[${index}] must be an object`);
    }
    const { sku, quantity, unitPrice } = raw;
    if (typeof sku !== "string" || sku.length === 0) {
      throw new ValidationError(`lines[${index}].sku must be a non-empty string`);
    }
    if (typeof quantity !== "number" || typeof unitPrice !== "number") {
      throw new ValidationError(`lines[${index}] quantity and unitPrice must be numbers`);
    }
    return { sku, quantity, unitPrice };
  });
}

/**
 * Parses an untrusted request body into a domain `Order`.
 *
 * Only known fields are copied across: unexpected properties in the payload
 * are dropped rather than passed into the domain. Shape is checked here;
 * business rules are checked by `validateOrder`.
 */
export function parseCreateOrderRequest(body: unknown): Result<CreateOrderRequest> {
  try {
    if (!isRecord(body)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const customerId = body.customerId;
    if (typeof customerId !== "string" || customerId.length === 0) {
      throw new ValidationError("customerId is required");
    }

    const customerTier = body.customerTier;
    if (typeof customerTier !== "string" || !TIERS.includes(customerTier as CustomerTier)) {
      throw new ValidationError(`customerTier must be one of ${TIERS.join(", ")}`);
    }

    const shippingMethod = body.shippingMethod;
    if (
      typeof shippingMethod !== "string" ||
      !METHODS.includes(shippingMethod as ShippingMethod)
    ) {
      throw new ValidationError(`shippingMethod must be one of ${METHODS.join(", ")}`);
    }

    const countryCode = body.countryCode;
    if (typeof countryCode !== "string") {
      throw new ValidationError("countryCode is required");
    }

    const discountPercent = body.discountPercent;
    if (discountPercent !== undefined && typeof discountPercent !== "number") {
      throw new ValidationError("discountPercent must be a number");
    }

    const promoCode = body.promoCode;
    if (promoCode !== undefined && typeof promoCode !== "string") {
      throw new ValidationError("promoCode must be a string");
    }

    const order: Order = {
      customerTier: customerTier as CustomerTier,
      lines: parseLines(body.lines),
      shippingMethod: shippingMethod as ShippingMethod,
      countryCode,
      ...(discountPercent === undefined ? {} : { discountPercent }),
      ...(promoCode === undefined ? {} : { promoCode }),
    };

    return ok({ customerId, order });
  } catch (error) {
    return err(error instanceof ValidationError ? error : new ValidationError("Invalid request"));
  }
}
