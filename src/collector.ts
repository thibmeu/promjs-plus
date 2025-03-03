import { Labels, Metric, MetricValue } from "./types";
import { findExistingMetric } from "./utils";

export abstract class Collector<T extends MetricValue> {
  private readonly data: Metric<T>[];

  constructor() {
    this.data = [];
  }

  get(labels?: Labels): Metric<T> | undefined {
    return findExistingMetric<T>(labels, this.data);
  }

  set(value: T, labels?: Labels): this {
    const existing = findExistingMetric(labels, this.data);
    if (existing) {
      existing.value = value;
    } else {
      this.data.push({
        labels,
        value,
      });
    }

    return this;
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
