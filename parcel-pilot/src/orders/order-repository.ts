import type { OrderRecord } from "./order";

export interface OrderRepository {
  save(record: OrderRecord): Promise<void>;
  findById(id: string): Promise<OrderRecord | undefined>;
  listByCustomer(customerId: string): Promise<OrderRecord[]>;
}
