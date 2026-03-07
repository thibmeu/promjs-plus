import { Registry } from "./registry";

export * from "./types";
export { Registry };
export type { MetricsOptions } from "./registry";

export const PROMETHEUS_CONTENT_TYPE = 'text/plain; version=0.0.4' as const;
export const OPENMETRICS_CONTENT_TYPE = 'application/openmetrics-text; version=1.0.0' as const;

export function linearBuckets(start: number, width: number, count: number): number[] {
  if (count < 1) {
    throw new Error('linearBuckets requires count >= 1');
  }
  const buckets: number[] = [];
  for (let i = 0; i < count; i++) {
    buckets.push(start + i * width);
  }
  return buckets;
}

export function exponentialBuckets(start: number, factor: number, count: number): number[] {
  if (start <= 0) {
    throw new Error('exponentialBuckets requires start > 0');
  }
  if (factor <= 1) {
    throw new Error('exponentialBuckets requires factor > 1');
  }
  if (count < 1) {
    throw new Error('exponentialBuckets requires count >= 1');
  }
  const buckets: number[] = [];
  let value = start;
  for (let i = 0; i < count; i++) {
    buckets.push(value);
    value *= factor;
  }
  return buckets;
}

export default () => new Registry();
