// Cloudflare Workers example - promjs-plus metrics endpoint
// Zero dependencies, ~5kb, runs on edge

import {
  Registry,
  MetricFormat,
  PROMETHEUS_CONTENT_TYPE,
  OPENMETRICS_CONTENT_TYPE,
  exponentialBuckets,
} from 'promjs-plus';

// Create registry with default labels (applied to all metrics)
const registry = new Registry({ defaultLabels: { env: 'production', region: 'ewr' } });

// Define metrics
const requestCounter = registry.create('counter', 'http_requests_total', 'Total HTTP requests');
// Use exponentialBuckets for latency: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512ms
const requestDuration = registry.create('histogram', 'http_request_duration_ms', 'Request duration in ms', exponentialBuckets(1, 2, 10));
const activeConnections = registry.create('gauge', 'active_connections', 'Current active connections');

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Expose /metrics endpoint for Prometheus/OpenMetrics scraping
    if (url.pathname === '/metrics') {
      // Content negotiation: prefer OpenMetrics if client accepts it
      const accept = request.headers.get('Accept') || '';
      const format: MetricFormat = accept.includes('openmetrics') ? 'openmetrics' : 'prometheus';
      const contentType = format === 'openmetrics' ? OPENMETRICS_CONTENT_TYPE : PROMETHEUS_CONTENT_TYPE;

      return new Response(registry.metrics({ format }), {
        headers: { 'Content-Type': contentType },
      });
    }

    // Track request
    const start = Date.now();
    activeConnections.inc({ handler: 'fetch' });

    try {
      // Your app logic here
      const response = new Response(`Hello from ${url.pathname}`);

      // Record metrics (labels override defaults on conflict)
      requestCounter.inc({ method: request.method, path: url.pathname, status: '200' });
      requestDuration.observe(Date.now() - start, { method: request.method });

      return response;
    } finally {
      activeConnections.dec({ handler: 'fetch' });
    }
  },
};
