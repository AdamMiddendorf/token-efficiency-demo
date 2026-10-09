import type { Customer } from "./customer";
import type { CustomerTier } from "./customer-tier";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | undefined>;
  listByTier(tier: CustomerTier): Promise<Customer[]>;
  save(customer: Customer): Promise<void>;
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  constructor(seed: readonly Customer[] = []) {
    for (const customer of seed) {
      this.customers.set(customer.id, customer);
    }
  }

  async findById(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async listByTier(tier: CustomerTier): Promise<Customer[]> {
    return [...this.customers.values()].filter((customer) => customer.tier === tier);
  }

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }
}
