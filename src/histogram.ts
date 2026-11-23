import { Collector } from "./collector";
import { HistogramValue, HistogramValueEntries, Labels } from "./types";

function getInitialValue(bucketKeys: readonly string[]): HistogramValue {
  const entries: HistogramValueEntries = { "+Inf": 0 };
  for (const key of bucketKeys) {
    entries[key] = 0;
  }
  return { entries, sum: 0, count: 0 };
}

export class Histogram extends Collector<HistogramValue> {
  private readonly buckets: number[];
  readonly bucketKeys: readonly string[];

  constructor(buckets: number[] = []) {
    super();
    // Finite bounds only (+Inf is implicit), deduped, smallest first
    this.buckets = [...new Set(buckets.filter(Number.isFinite))].sort((a, b) => a - b);
    this.bucketKeys = this.buckets.map(String);
    this.set(getInitialValue(this.bucketKeys));
    this.observe = this.observe.bind(this);
  }

  observe(value: number, labels?: Labels): this {
    const metric = this.get(labels) ?? this.set(getInitialValue(this.bucketKeys), labels);

    // Find the bucket this value falls into and increment only that bucket
    // Store raw (non-cumulative) counts; cumulative is computed at export
    let bucketKey = "+Inf";
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        bucketKey = this.bucketKeys[i];
        break;
      }
    }
    metric.value.entries[bucketKey] += 1;

    metric.value.sum += value;
    metric.value.count += 1;

    return this;
  }

  reset(labels?: Labels): void {
    this.set(getInitialValue(this.bucketKeys), labels);
  }
}
