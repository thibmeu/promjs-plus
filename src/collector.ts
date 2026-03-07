import { Labels, Metric, MetricValue } from "./types";
import { findExistingMetric } from "./utils";

export abstract class Collector<T extends MetricValue> {
  private readonly data: Metric<T>[];
  // Fast path cache for no-label metric
  private noLabelMetric: Metric<T> | undefined;

  constructor() {
    this.data = [];
    this.noLabelMetric = undefined;
  }

  get(labels?: Labels): Metric<T> | undefined {
    if (!labels) {
      return this.noLabelMetric;
    }
    return findExistingMetric<T>(labels, this.data);
  }

  set(value: T, labels?: Labels): Metric<T> {
    if (!labels) {
      if (this.noLabelMetric) {
        this.noLabelMetric.value = value;
        return this.noLabelMetric;
      }
      const metric: Metric<T> = { labels: undefined, value };
      this.noLabelMetric = metric;
      this.data.push(metric);
      return metric;
    }
    const existing = findExistingMetric(labels, this.data);
    if (existing) {
      existing.value = value;
      return existing;
    }
    const metric: Metric<T> = { labels, value };
    this.data.push(metric);
    return metric;
  }

  collect(labels?: Labels): Metric<T>[] {
    if (!labels) {
      return this.data;
    }
    return this.data.filter((item) => {
      if (!item.labels) {
        return false;
      }
      const entries = Object.entries(labels);
      for (const [label, value] of entries) {
        if (item.labels[label] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  resetAll(): this {
    for (const { labels } of this.data) {
      this.reset(labels);
    }

    return this;
  }

  abstract reset(labels?: Labels): void;
}
