import { Registry } from "./registry";

export * from "./types";
export { Registry };
export type { MetricsOptions } from "./registry";

export const PROMETHEUS_CONTENT_TYPE = 'text/plain; version=0.0.4' as const;
export const OPENMETRICS_CONTENT_TYPE = 'application/openmetrics-text; version=1.0.0' as const;

export default () => new Registry();
