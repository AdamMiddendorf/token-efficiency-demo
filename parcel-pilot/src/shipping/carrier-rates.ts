import type { ShippingMethod } from "./shipping-method";
import type { ShippingZone } from "./shipping-zones";

/**
 * What carriers charge **us**, by weight band. These are cost figures used for
 * margin reporting and for choosing a carrier.
 *
 * They are not what the customer pays. Customer-facing shipping charges are
 * decided in `src/pricing/shipping-price.ts`.
 */
export interface CarrierRate {
  carrier: string;
  zone: ShippingZone;
  method: ShippingMethod;
  /** Inclusive upper bound of the weight band, in grams. */
  maxWeightGrams: number;
  /** Carrier cost to us, in minor units. */
  costMinorUnits: number;
}

export const CARRIER_RATES: readonly CarrierRate[] = [
  { carrier: "royal-parcel", zone: "domestic", method: "standard", maxWeightGrams: 2_000, costMinorUnits: 289 },
  { carrier: "royal-parcel", zone: "domestic", method: "standard", maxWeightGrams: 20_000, costMinorUnits: 640 },
  { carrier: "swiftline", zone: "domestic", method: "express", maxWeightGrams: 2_000, costMinorUnits: 850 },
  { carrier: "swiftline", zone: "domestic", method: "express", maxWeightGrams: 20_000, costMinorUnits: 1_420 },
  { carrier: "europost", zone: "europe", method: "standard", maxWeightGrams: 5_000, costMinorUnits: 920 },
  { carrier: "europost", zone: "europe", method: "express", maxWeightGrams: 5_000, costMinorUnits: 1_780 },
  { carrier: "globalfreight", zone: "international", method: "standard", maxWeightGrams: 30_000, costMinorUnits: 2_450 },
];

export function cheapestCarrier(
  zone: ShippingZone,
  method: ShippingMethod,
  weightGrams: number,
): CarrierRate | undefined {
  return CARRIER_RATES.filter(
    (rate) => rate.zone === zone && rate.method === method && weightGrams <= rate.maxWeightGrams,
  ).sort((a, b) => a.costMinorUnits - b.costMinorUnits)[0];
}
