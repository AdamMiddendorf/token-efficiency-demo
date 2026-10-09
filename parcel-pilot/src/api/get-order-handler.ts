import type { OrderService } from "../orders/order-service";
import type { HandlerResponse } from "./handler-response";
import { type OrderResponse, toOrderResponse } from "./order-response";

export async function getOrderHandler(
  service: OrderService,
  id: string,
): Promise<HandlerResponse<OrderResponse>> {
  const record = await service.getOrder(id);

  if (!record) {
    return { status: 404, body: { error: `Order ${id} was not found`, code: "NOT_FOUND" } };
  }
  return { status: 200, body: toOrderResponse(record) };
}
