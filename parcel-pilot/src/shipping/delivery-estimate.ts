import type { Clock } from "../shared/clock";
import type { ShippingMethod } from "./shipping-method";
import { type ShippingZone, zoneFor } from "./shipping-zones";

const WORKING_DAYS: Record<ShippingZone, Record<ShippingMethod, number>> = {
  domestic: { standard: 3, express: 1 },
  europe: { standard: 5, express: 2 },
  international: { standard: 10, express: 10 },
};

export interface DeliveryEstimate {
  zone: ShippingZone;
  method: ShippingMethod;
  workingDays: number;
  estimatedDeliveryDate: string;
}

function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }
  return result;
}

export function estimateDelivery(
  countryCode: string,
  method: ShippingMethod,
  clock: Clock,
): DeliveryEstimate {
  const zone = zoneFor(countryCode);
  const workingDays = WORKING_DAYS[zone][method];
  const estimated = addWorkingDays(clock.now(), workingDays);

  return {
    zone,
    method,
    workingDays,
    estimatedDeliveryDate: estimated.toISOString().slice(0, 10),
  };
}
