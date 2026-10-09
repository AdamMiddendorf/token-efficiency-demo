export interface StockLevel {
  sku: string;
  /** Units physically present. */
  onHand: number;
  /** Units promised to orders that have not yet shipped. */
  reserved: number;
}

export function availableUnits(level: StockLevel): number {
  return Math.max(0, level.onHand - level.reserved);
}

export function canFulfil(level: StockLevel, quantity: number): boolean {
  return availableUnits(level) >= quantity;
}
