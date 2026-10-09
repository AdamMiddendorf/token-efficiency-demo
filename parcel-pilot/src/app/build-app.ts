import { StaticProductCatalog } from "../catalog/product-catalog";
import { type AppConfig, defaultAppConfig } from "../config/app-config";
import type { Customer } from "../customers/customer";
import { InMemoryCustomerRepository } from "../customers/customer-repository";
import { createHttpApp, type HttpApp } from "../http/app";
import { InventoryService } from "../inventory/inventory-service";
import type { StockLevel } from "../inventory/stock-level";
import { ScriptedEmailClient, type EmailClient } from "../notifications/email-client";
import { NotificationLog } from "../notifications/notification-log";
import { NotificationService } from "../notifications/notification-service";
import { InMemoryOrderRepository } from "../orders/in-memory-order-repository";
import { OrderEventBus } from "../orders/order-events";
import { OrderService } from "../orders/order-service";
import { MetricsRegistry } from "../observability/metrics";
import { type Logger, StructuredLogger } from "../observability/logger";
import { PromotionEngine } from "../promotions/promotion-engine";
import { type Clock, systemClock } from "../shared/clock";
import { type IdGenerator, TimestampIdGenerator } from "../shared/id";

export interface ParcelPilot {
  config: AppConfig;
  http: HttpApp;
  orders: OrderService;
  inventory: InventoryService;
  events: OrderEventBus;
  metrics: MetricsRegistry;
  notificationLog: NotificationLog;
  logger: Logger;
}

export interface BuildAppOptions {
  config?: AppConfig;
  clock?: Clock;
  ids?: IdGenerator;
  logger?: Logger;
  emailClient?: EmailClient;
  customers?: readonly Customer[];
  stock?: readonly StockLevel[];
}

/**
 * Composition root. Every dependency is constructed here and passed down
 * explicitly; no module reaches for a global. Tests build their own instance
 * with fakes substituted, which is why there are no module-level singletons.
 */
export function buildApp(options: BuildAppOptions = {}): ParcelPilot {
  const config = options.config ?? defaultAppConfig;
  const clock = options.clock ?? systemClock;
  const ids = options.ids ?? new TimestampIdGenerator();
  const logger = options.logger ?? new StructuredLogger({ level: config.logLevel });
  const metrics = new MetricsRegistry();

  const catalog = new StaticProductCatalog();
  const customers = new InMemoryCustomerRepository(options.customers ?? []);
  const inventory = new InventoryService({ initialStock: options.stock ?? [], clock, ids });
  const events = new OrderEventBus(logger);
  const notificationLog = new NotificationLog();

  const notifications = new NotificationService(options.emailClient ?? new ScriptedEmailClient(), {
    clock,
    log: notificationLog,
    metrics,
    logger,
  });

  const orders = new OrderService({
    repository: new InMemoryOrderRepository(),
    notifications,
    clock,
    newId: () => ids.next("ord"),
    catalog,
    inventory: config.features.inventoryReservations ? inventory : undefined,
    promotions: config.features.promotionCodes ? new PromotionEngine(clock) : undefined,
    events: config.features.orderEvents ? events : undefined,
    metrics,
    logger,
  });

  const http = createHttpApp({ config, orderService: orders, customers, clock, logger, metrics, ids });

  return { config, http, orders, inventory, events, metrics, notificationLog, logger };
}
