import { createOrderHandler } from "../api/create-order-handler";
import { getOrderHandler } from "../api/get-order-handler";
import { listOrdersHandler } from "../api/list-orders-handler";
import { quoteHandler } from "../api/quote-handler";
import type { AppConfig } from "../config/app-config";
import type { CustomerRepository } from "../customers/customer-repository";
import type { OrderService } from "../orders/order-service";
import { METRIC_REQUEST_DURATION_MS, type MetricsRegistry } from "../observability/metrics";
import { createRequestContext } from "../observability/request-context";
import type { Logger } from "../observability/logger";
import type { Clock } from "../shared/clock";
import type { IdGenerator } from "../shared/id";
import { NotFoundError } from "../shared/errors";
import { errorBody, statusForError } from "./http-errors";
import { parseCreateOrderRequest } from "./request-parsing";
import { type HttpRequest, type HttpResponse, Router } from "./router";

export interface HttpAppDeps {
  config: AppConfig;
  orderService: OrderService;
  customers: CustomerRepository;
  clock: Clock;
  logger: Logger;
  metrics: MetricsRegistry;
  ids: IdGenerator;
}

export interface HttpApp {
  handle(request: HttpRequest): Promise<HttpResponse>;
  routes(): string[];
}

const JSON_HEADERS = { "content-type": "application/json" };

function respond(status: number, body: unknown): HttpResponse {
  return { status, body, headers: { ...JSON_HEADERS } };
}

export function createHttpApp(deps: HttpAppDeps): HttpApp {
  const router = new Router();

  router.get("/health", () =>
    respond(200, {
      status: "ok",
      environment: deps.config.environment,
      time: deps.clock.now().toISOString(),
    }),
  );

  router.post("/orders", async (request) => {
    const parsed = parseCreateOrderRequest(request.body);
    if (!parsed.ok) {
      return respond(400, errorBody(parsed.error));
    }

    const customer = await deps.customers.findById(parsed.value.customerId);
    if (!customer) {
      return respond(404, errorBody(new NotFoundError(`Unknown customer ${parsed.value.customerId}`)));
    }

    const result = await createOrderHandler(deps.orderService, parsed.value.order, customer);
    return respond(result.status, result.body);
  });

  router.get("/orders/:id", async (_request, params) => {
    const result = await getOrderHandler(deps.orderService, params.id);
    return respond(result.status, result.body);
  });

  router.get("/customers/:customerId/orders", async (_request, params) => {
    const result = await listOrdersHandler(deps.orderService, params.customerId);
    return respond(result.status, result.body);
  });

  router.post("/quotes", async (request) => {
    const parsed = parseCreateOrderRequest(request.body);
    if (!parsed.ok) {
      return respond(400, errorBody(parsed.error));
    }

    const result = await quoteHandler(parsed.value.order, {
      clock: deps.clock,
      currency: deps.config.currency,
    });
    return respond(result.status, result.body);
  });

  return {
    routes: () => router.describe(),

    async handle(request: HttpRequest): Promise<HttpResponse> {
      const context = createRequestContext({
        ids: deps.ids,
        logger: deps.logger,
        metrics: deps.metrics,
        now: () => deps.clock.now().getTime(),
      });

      const match = router.match(request.method, request.path);
      if (!match) {
        context.logger.info("no route", { method: request.method, path: request.path });
        return respond(404, { error: "Not found", code: "NOT_FOUND" });
      }

      try {
        const response = await match.handler(request, match.params);
        context.logger.info("request handled", {
          method: request.method,
          path: request.path,
          status: response.status,
        });
        return { ...response, headers: { ...response.headers, "x-request-id": context.requestId } };
      } catch (error) {
        const status = statusForError(error);
        context.logger.error("request failed", {
          method: request.method,
          path: request.path,
          status,
          error: error instanceof Error ? error.message : String(error),
        });
        return { ...respond(status, errorBody(error)), headers: { ...JSON_HEADERS, "x-request-id": context.requestId } };
      } finally {
        deps.metrics.observe(
          METRIC_REQUEST_DURATION_MS,
          deps.clock.now().getTime() - context.startedAt,
          { path: request.path },
        );
      }
    },
  };
}
