import type { ProductCatalog } from "../catalog/product-catalog";
import type { Customer } from "../customers/customer";
import type { InventoryService } from "../inventory/inventory-service";
import type { NotificationService } from "../notifications/notification-service";
import {
  METRIC_ORDERS_PLACED,
  METRIC_ORDERS_REJECTED,
  METRIC_NOTIFICATION_ATTEMPTS,
  type MetricsRegistry,
} from "../observability/metrics";
import { type Logger, nullLogger } from "../observability/logger";
import { calculateOrderTotal } from "../pricing/calculate-order-total";
import type { PricingPolicy } from "../pricing/pricing-policy";
import type { PromotionEngine } from "../promotions/promotion-engine";
import { type Clock, systemClock } from "../shared/clock";
import { ValidationError } from "../shared/errors";
import { err, ok, type Result } from "../shared/result";
import { selectShippingMethod } from "../shipping/shipping-selector";
import type { Order, OrderRecord } from "./order";
import type { OrderEventBus } from "./order-events";
import { orderPlaced } from "./order-events";
import type { OrderRepository } from "./order-repository";
import { validateOrder } from "./order-validation";

export interface OrderServiceOptions {
  repository: OrderRepository;
  notifications?: NotificationService;
  clock?: Clock;
  pricingPolicy?: PricingPolicy;
  newId?: () => string;
  catalog?: ProductCatalog;
  inventory?: InventoryService;
  promotions?: PromotionEngine;
  events?: OrderEventBus;
  metrics?: MetricsRegistry;
  logger?: Logger;
}

let sequence = 0;
const defaultNewId = (): string => `ord_${String(++sequence).padStart(6, "0")}`;

/**
 * Order lifecycle. The service owns the *order* of operations — validate,
 * resolve promotions, reserve stock, price, persist, notify — but owns none of
 * the rules themselves. Each rule lives in its own module.
 */
export class OrderService {
  private readonly repository: OrderRepository;
  private readonly notifications?: NotificationService;
  private readonly clock: Clock;
  private readonly pricingPolicy?: PricingPolicy;
  private readonly newId: () => string;
  private readonly catalog?: ProductCatalog;
  private readonly inventory?: InventoryService;
  private readonly promotions?: PromotionEngine;
  private readonly events?: OrderEventBus;
  private readonly metrics?: MetricsRegistry;
  private readonly logger: Logger;

  constructor(options: OrderServiceOptions) {
    this.repository = options.repository;
    this.notifications = options.notifications;
    this.clock = options.clock ?? systemClock;
    this.pricingPolicy = options.pricingPolicy;
    this.newId = options.newId ?? defaultNewId;
    this.catalog = options.catalog;
    this.inventory = options.inventory;
    this.promotions = options.promotions;
    this.events = options.events;
    this.metrics = options.metrics;
    this.logger = options.logger ?? nullLogger;
  }

  async placeOrder(order: Order, customer: Customer): Promise<Result<OrderRecord>> {
    const issues = validateOrder(order, { catalog: this.catalog });
    if (issues.length > 0) {
      await this.reject(customer, issues[0].message);
      return err(new ValidationError(issues[0].message));
    }

    const priced = this.withResolvedPromotion(order);

    const shippingMethod = selectShippingMethod({
      requestedMethod: priced.shippingMethod,
      countryCode: priced.countryCode,
    });
    const effectiveOrder: Order = { ...priced, shippingMethod };

    const id = this.newId();

    const reservation = this.inventory?.reserve(id, effectiveOrder.lines);
    if (reservation && !reservation.ok) {
      await this.reject(customer, reservation.error.message);
      return err(reservation.error);
    }

    const total = this.pricingPolicy
      ? calculateOrderTotal(effectiveOrder, this.pricingPolicy)
      : calculateOrderTotal(effectiveOrder);

    const record: OrderRecord = {
      id,
      customerId: customer.id,
      order: effectiveOrder,
      total,
      status: "placed",
      placedAt: this.clock.now().toISOString(),
      ...(reservation?.ok ? { reservationId: reservation.value.id } : {}),
    };

    await this.repository.save(record);
    this.metrics?.increment(METRIC_ORDERS_PLACED, { tier: effectiveOrder.customerTier });
    this.logger.info("order placed", { orderId: record.id, total: total.total });

    await this.events?.publish(orderPlaced(record));

    if (this.notifications) {
      const result = await this.notifications.sendOrderConfirmation(customer, record);
      this.metrics?.increment(METRIC_NOTIFICATION_ATTEMPTS, {}, result.attempts);
      await this.events?.publish({
        type: "order.notified",
        orderId: record.id,
        attempts: result.attempts,
        delivered: result.delivered,
        at: this.clock.now().toISOString(),
      });
    }

    return ok(record);
  }

  async cancelOrder(id: string): Promise<Result<OrderRecord>> {
    const record = await this.repository.findById(id);
    if (!record) {
      return err(new ValidationError(`Order ${id} was not found`));
    }

    const cancelled: OrderRecord = { ...record, status: "cancelled" };
    await this.repository.save(cancelled);

    if (record.reservationId) {
      this.inventory?.release(record.reservationId);
    }
    await this.events?.publish({
      type: "order.cancelled",
      orderId: id,
      at: this.clock.now().toISOString(),
    });

    return ok(cancelled);
  }

  async getOrder(id: string): Promise<OrderRecord | undefined> {
    return this.repository.findById(id);
  }

  async listOrdersForCustomer(customerId: string): Promise<OrderRecord[]> {
    return this.repository.listByCustomer(customerId);
  }

  /**
   * Resolves a submitted campaign code into a discount percentage. An invalid
   * or ineligible code is not an error: the order is simply priced without it.
   */
  private withResolvedPromotion(order: Order): Order {
    if (!this.promotions || !order.promoCode) {
      return order;
    }

    const subtotal = order.lines.reduce(
      (total, line) => total + line.unitPrice * line.quantity,
      0,
    );
    const outcome = this.promotions.resolve({
      code: order.promoCode,
      customerTier: order.customerTier,
      subtotal,
    });

    if (!outcome.applied) {
      this.logger.info("promotion not applied", { code: order.promoCode, reason: outcome.reason });
      return order;
    }

    return { ...order, discountPercent: outcome.percentOff };
  }

  private async reject(customer: Customer, reason: string): Promise<void> {
    this.metrics?.increment(METRIC_ORDERS_REJECTED);
    this.logger.info("order rejected", { customerId: customer.id, reason });
    await this.events?.publish({
      type: "order.rejected",
      customerId: customer.id,
      reason,
      at: this.clock.now().toISOString(),
    });
  }
}
