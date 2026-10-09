export type CustomerTier = "retail" | "wholesale";

export function isWholesale(tier: CustomerTier): boolean {
  return tier === "wholesale";
}
