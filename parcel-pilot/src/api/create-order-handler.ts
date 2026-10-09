import type { Customer } from "../customers/customer";
import type { Order } from "../orders/order";
import type { OrderService } from "../orders/order-service";
import type { HandlerResponse } from "./handler-response";
import { type OrderResponse, toOrderResponse } from "./order-response";

export async function createOrderHandler(
  service: OrderService,
  order: Order,
  customer: Customer,
): Promise<HandlerResponse<OrderResponse>> {
  const result = await service.placeOrder(order, customer);

  if (!result.ok) {
    return { status: 400, body: { error: result.error.message, code: result.error.code } };
  }
  return { status: 201, body: toOrderResponse(result.value) };
}
