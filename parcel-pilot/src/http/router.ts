export interface HttpRequest {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface HttpResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

export type RouteParams = Record<string, string>;
export type RouteHandler = (
  request: HttpRequest,
  params: RouteParams,
) => Promise<HttpResponse> | HttpResponse;

interface Route {
  method: string;
  segments: string[];
  handler: RouteHandler;
}

export interface RouteMatch {
  handler: RouteHandler;
  params: RouteParams;
}

function split(path: string): string[] {
  return path.split("/").filter((segment) => segment.length > 0);
}

/**
 * A transport-agnostic router. It matches a method and path to a handler and
 * extracts `:name` parameters. There is no network server in this repository;
 * requests are plain objects, which keeps the whole API testable in process.
 */
export class Router {
  private readonly routes: Route[] = [];

  add(method: string, pattern: string, handler: RouteHandler): this {
    this.routes.push({ method: method.toUpperCase(), segments: split(pattern), handler });
    return this;
  }

  get(pattern: string, handler: RouteHandler): this {
    return this.add("GET", pattern, handler);
  }

  post(pattern: string, handler: RouteHandler): this {
    return this.add("POST", pattern, handler);
  }

  match(method: string, path: string): RouteMatch | undefined {
    const wanted = method.toUpperCase();
    const segments = split(path);

    for (const route of this.routes) {
      if (route.method !== wanted || route.segments.length !== segments.length) {
        continue;
      }

      const params: RouteParams = {};
      let matched = true;

      for (let i = 0; i < route.segments.length; i += 1) {
        const expected = route.segments[i];
        const actual = segments[i];
        if (expected.startsWith(":")) {
          params[expected.slice(1)] = decodeURIComponent(actual);
        } else if (expected !== actual) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { handler: route.handler, params };
      }
    }

    return undefined;
  }

  /** Method/path pairs, for diagnostics and for the health endpoint. */
  describe(): string[] {
    return this.routes.map((route) => `${route.method} /${route.segments.join("/")}`);
  }
}
