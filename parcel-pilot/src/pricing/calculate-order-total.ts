import type { Order, OrderTotal } from "../orders/order";
import { applyDiscount } from "./apply-discount";
import type { Money } from "./money";
import { defaultPricingPolicy, type PricingPolicy } from "./pricing-policy";
import { shippingPriceFor } from "./shipping-price";
import { calculateTax } from "./tax-calculator";

function merchandiseSubtotal(order: Order): Money {
  return order.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}

/**
 * The order pricing pipeline.
 *
 * subtotal -> discount -> discounted merchandise subtotal -> shipping
 *          -> taxable amount -> tax -> total
 */
export function calculateOrderTotal(
  order: Order,
  policy: PricingPolicy = defaultPricingPolicy,
): OrderTotal {
  const subtotal = merchandiseSubtotal(order);

  const discount = applyDiscount(
    {
      subtotal,
      customerTier: order.customerTier,
      discountPercent: order.discountPercent,
    },
    policy,
  );

  const discountedMerchandiseSubtotal = subtotal - discount;

  const shipping = shippingPriceFor(
    { method: order.shippingMethod, discountedMerchandiseSubtotal },
    policy,
  );

  const taxableAmount = subtotal + shipping;
  const tax = calculateTax(taxableAmount, order.countryCode);

  const total = discountedMerchandiseSubtotal + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}
