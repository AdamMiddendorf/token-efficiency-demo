export interface MetricLabels {
  [key: string]: string;
}

interface CounterEntry {
  name: string;
  labels: MetricLabels;
  value: number;
}

interface HistogramEntry {
  name: string;
  labels: MetricLabels;
  samples: number[];
}

function keyOf(name: string, labels: MetricLabels): string {
  const parts = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return parts.length === 0 ? name : `${name}{${parts.join(",")}}`;
}

/**
 * Minimal in-process metrics registry. There is no metrics backend in this
 * repository; the registry exists so that call sites are instrumented
 * consistently and so tests can assert on what was recorded.
 */
export class MetricsRegistry {
  private readonly counters = new Map<string, CounterEntry>();
  private readonly histograms = new Map<string, HistogramEntry>();

  increment(name: string, labels: MetricLabels = {}, by = 1): void {
    const key = keyOf(name, labels);
    const existing = this.counters.get(key);
    if (existing) {
      existing.value += by;
      return;
    }
    this.counters.set(key, { name, labels, value: by });
  }

  observe(name: string, value: number, labels: MetricLabels = {}): void {
    const key = keyOf(name, labels);
    const existing = this.histograms.get(key);
    if (existing) {
      existing.samples.push(value);
      return;
    }
    this.histograms.set(key, { name, labels, samples: [value] });
  }

  counter(name: string, labels: MetricLabels = {}): number {
    return this.counters.get(keyOf(name, labels))?.value ?? 0;
  }

  samples(name: string, labels: MetricLabels = {}): readonly number[] {
    return this.histograms.get(keyOf(name, labels))?.samples ?? [];
  }

  snapshot(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [key, entry] of this.counters) {
      out[key] = entry.value;
    }
    for (const [key, entry] of this.histograms) {
      out[`${key}.count`] = entry.samples.length;
      out[`${key}.sum`] = entry.samples.reduce((a, b) => a + b, 0);
    }
    return out;
  }

  reset(): void {
    this.counters.clear();
    this.histograms.clear();
  }
}

export const METRIC_ORDERS_PLACED = "orders.placed";
export const METRIC_ORDERS_REJECTED = "orders.rejected";
export const METRIC_NOTIFICATION_ATTEMPTS = "notifications.attempts";
export const METRIC_NOTIFICATION_FAILED = "notifications.failed";
export const METRIC_REQUEST_DURATION_MS = "http.request.duration_ms";
