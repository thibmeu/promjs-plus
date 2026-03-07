// Cloudflare Workers example - promjs-plus metrics endpoint
// Zero dependencies, ~5kb, runs on edge

import { Registry } from 'promjs-plus';

// Create registry with default labels (applied to all metrics)
const registry = new Registry({ defaultLabels: { env: 'production', region: 'ewr' } });

// Define metrics
const requestCounter = registry.create('counter', 'http_requests_total', 'Total HTTP requests');
const requestDuration = registry.create('histogram', 'http_request_duration_ms', 'Request duration in ms');
const activeConnections = registry.create('gauge', 'active_connections', 'Current active connections');

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Expose /metrics endpoint for Prometheus scraping
    if (url.pathname === '/metrics') {
      return new Response(registry.metrics(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
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
