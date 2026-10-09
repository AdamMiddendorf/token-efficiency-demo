import type { OrderRecord } from "./order";
import type { OrderRepository } from "./order-repository";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly records = new Map<string, OrderRecord>();

  async save(record: OrderRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async findById(id: string): Promise<OrderRecord | undefined> {
    return this.records.get(id);
  }

  async listByCustomer(customerId: string): Promise<OrderRecord[]> {
    return [...this.records.values()].filter((record) => record.customerId === customerId);
  }
}
