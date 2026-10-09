import { NotFoundError } from "../shared/errors";
import type { Product } from "./product";

const CATALOG: readonly Product[] = [
  { sku: "BOX-A", name: "Small shipping box", category: "packaging", weightGrams: 180, listPrice: 10_000, active: true },
  { sku: "BOX-B", name: "Medium shipping box", category: "packaging", weightGrams: 260, listPrice: 3_333, active: true },
  { sku: "CRATE-3", name: "Reinforced crate", category: "packaging", weightGrams: 4_200, listPrice: 24_900, active: true },
  { sku: "PALLET-1", name: "Export pallet", category: "equipment", weightGrams: 18_000, listPrice: 100_000, active: true },
  { sku: "TAPE-1", name: "Packing tape", category: "consumable", weightGrams: 95, listPrice: 499, active: true },
  { sku: "WRAP-2", name: "Bubble wrap roll", category: "consumable", weightGrams: 1_100, listPrice: 1_250, active: true },
  { sku: "LABEL-9", name: "Thermal labels", category: "consumable", weightGrams: 300, listPrice: 2_100, active: true },
  { sku: "SCALE-1", name: "Parcel scale", category: "equipment", weightGrams: 2_400, listPrice: 45_000, active: false },
];

export interface ProductCatalog {
  find(sku: string): Product | undefined;
  require(sku: string): Product;
  list(): readonly Product[];
  listByCategory(category: Product["category"]): readonly Product[];
}

export class StaticProductCatalog implements ProductCatalog {
  private readonly bySku: Map<string, Product>;

  constructor(products: readonly Product[] = CATALOG) {
    this.bySku = new Map(products.map((product) => [product.sku, product]));
  }

  find(sku: string): Product | undefined {
    return this.bySku.get(sku.toUpperCase());
  }

  require(sku: string): Product {
    const product = this.find(sku);
    if (!product) {
      throw new NotFoundError(`Unknown SKU ${sku}`);
    }
    return product;
  }

  list(): readonly Product[] {
    return [...this.bySku.values()];
  }

  listByCategory(category: Product["category"]): readonly Product[] {
    return this.list().filter((product) => product.category === category);
  }
}

/** Total shipping weight of a set of order lines, in grams. */
export function totalWeightGrams(
  catalog: ProductCatalog,
  lines: readonly { sku: string; quantity: number }[],
): number {
  return lines.reduce((total, line) => {
    const product = catalog.find(line.sku);
    return total + (product ? product.weightGrams * line.quantity : 0);
  }, 0);
}
