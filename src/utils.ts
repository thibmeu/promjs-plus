import { HistogramValue, Labels, Metric, MetricValue } from "./types";

function getLabelPairs(
  metric: Metric<MetricValue>,
  defaultLabels: Labels = {},
): string {
  // Metric labels override default labels
  const merged = { ...defaultLabels, ...metric.labels };
  const pairs = Object.entries(merged).map(([k, v]) => `${k}="${v}"`);
  return pairs.length === 0 ? "" : `${pairs.join(",")}`;
}

export function formatHistogramOrSummary(
  name: string,
  metric: Metric<HistogramValue>,
  bucketLabel = "le",
  defaultLabels: Labels = {},
): string {
  let str = "";
  const labels = getLabelPairs(metric, defaultLabels);
  if (labels.length > 0) {
    str += `${name}_count{${labels}} ${metric.value.count}\n`;
    str += `${name}_sum{${labels}} ${metric.value.sum}\n`;
  } else {
    str += `${name}_count ${metric.value.count}\n`;
    str += `${name}_sum ${metric.value.sum}\n`;
  }

  return Object.entries(metric.value.entries).reduce(
    (result, [bucket, count]) => {
      if (labels.length > 0) {
        return `${result}${name}_bucket{${bucketLabel}="${bucket}",${labels}} ${count}\n`;
      }
      return `${result}${name}_bucket{${bucketLabel}="${bucket}"} ${count}\n`;
    },
    str,
  );
}

export function findExistingMetric<T extends MetricValue>(
  labels: Labels,
  values: Metric<T>[],
): Metric<T> | undefined {
  return values.find((v) => {
    if (!v.labels) {
      return false;
    }
    if (Object.keys(v.labels).length !== Object.keys(labels).length) {
      return false;
    }
    for (const [label, value] of Object.entries(labels)) {
      if (v.labels[label] !== value) {
        return false;
      }
    }
    return true;
  });
}

export function formatCounterOrGauge(
  name: string,
  metric: Metric<MetricValue>,
  defaultLabels: Labels = {},
): string {
  const value = ` ${metric.value.toString()}`;
  const labels = getLabelPairs(metric, defaultLabels);
  if (labels.length === 0) {
    return `${name}${value}\n`;
  }
  return `${name}{${labels}}${value}\n`;
}
