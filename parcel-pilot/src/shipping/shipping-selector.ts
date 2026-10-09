import type { ShippingMethod } from "./shipping-method";
import { expressAvailableIn, zoneFor } from "./shipping-zones";

export interface ShippingSelectionInput {
  requestedMethod: ShippingMethod;
  countryCode: string;
}

/**
 * Chooses the shipping method that will actually be used. This is a
 * *selection* concern only; the price of the selected method is decided in
 * src/pricing/shipping-price.ts.
 */
export function selectShippingMethod(input: ShippingSelectionInput): ShippingMethod {
  const zone = zoneFor(input.countryCode);
  if (input.requestedMethod === "express" && !expressAvailableIn(zone)) {
    return "standard";
  }
  return input.requestedMethod;
}
