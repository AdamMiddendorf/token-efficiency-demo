import type { OrderService } from "../orders/order-service";
import type { HandlerResponse } from "./handler-response";
import { type OrderResponse, toOrderResponse } from "./order-response";

export interface OrderListResponse {
  orders: OrderResponse[];
  count: number;
}

export async function listOrdersHandler(
  service: OrderService,
  customerId: string,
): Promise<HandlerResponse<OrderListResponse>> {
  const records = await service.listOrdersForCustomer(customerId);
  const orders = records.map((record) => toOrderResponse(record));

  return { status: 200, body: { orders, count: orders.length } };
}
