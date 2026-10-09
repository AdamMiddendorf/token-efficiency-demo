/**
 * Delivery zones. Zones affect how quickly a parcel can be delivered and which
 * methods are offered. They do not affect price: see src/pricing/shipping-price.ts.
 */
export type ShippingZone = "domestic" | "europe" | "international";

const ZONE_BY_COUNTRY: Record<string, ShippingZone> = {
  GB: "domestic",
  IE: "europe",
  DE: "europe",
  FR: "europe",
  NL: "europe",
  US: "international",
  AU: "international",
  NZ: "international",
};

export function zoneFor(countryCode: string): ShippingZone {
  return ZONE_BY_COUNTRY[countryCode.toUpperCase()] ?? "international";
}

export function expressAvailableIn(zone: ShippingZone): boolean {
  return zone !== "international";
}
