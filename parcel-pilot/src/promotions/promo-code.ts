import type { Promotion } from "./promotion";

/** Campaign definitions. In production these come from the marketing CMS. */
export const PROMOTIONS: readonly Promotion[] = [
  {
    code: "WELCOME10",
    description: "10% off a first order",
    percentOff: 10,
    minimumSubtotalMinorUnits: 2_000,
    eligibleTiers: ["retail"],
    startsAt: "2025-01-01T00:00:00.000Z",
    endsAt: "2027-01-01T00:00:00.000Z",
    active: true,
  },
  {
    code: "TRADE15",
    description: "15% off for trade accounts",
    percentOff: 15,
    minimumSubtotalMinorUnits: 50_000,
    eligibleTiers: ["wholesale"],
    startsAt: "2025-01-01T00:00:00.000Z",
    endsAt: "2027-01-01T00:00:00.000Z",
    active: true,
  },
  {
    code: "BULK20",
    description: "20% off large trade orders",
    percentOff: 20,
    minimumSubtotalMinorUnits: 250_000,
    eligibleTiers: ["wholesale"],
    startsAt: "2025-06-01T00:00:00.000Z",
    endsAt: "2027-06-01T00:00:00.000Z",
    active: true,
  },
  {
    code: "SPRING24",
    description: "Retired spring campaign",
    percentOff: 25,
    minimumSubtotalMinorUnits: 0,
    eligibleTiers: [],
    startsAt: "2024-03-01T00:00:00.000Z",
    endsAt: "2024-06-01T00:00:00.000Z",
    active: false,
  },
];

export function normaliseCode(code: string): string {
  return code.trim().toUpperCase();
}

export function findPromotion(code: string): Promotion | undefined {
  const wanted = normaliseCode(code);
  return PROMOTIONS.find((promotion) => promotion.code === wanted);
}
