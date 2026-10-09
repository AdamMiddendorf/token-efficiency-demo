export type ProductCategory = "packaging" | "consumable" | "equipment";

export interface Product {
  sku: string;
  name: string;
  category: ProductCategory;
  /** Shipping weight of a single unit, in grams. */
  weightGrams: number;
  /**
   * Current list price in minor units. Order lines capture their own
   * `unitPrice` when the order is placed, so changing a list price never
   * reprices an existing order.
   */
  listPrice: number;
  active: boolean;
}
