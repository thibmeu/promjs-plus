import { describe, test } from 'vitest';
import { Registry } from '../src/index';

describe('counter', () => {
  const registry = new Registry();
  const counter = registry.create('counter', 'test_counter', 'Test counter');

  test('inc() no labels', async ({ bench }) => {
    await bench('inc() no labels', () => {
      counter.inc();
    }).run();
  });

  test('inc() with labels', async ({ bench }) => {
    await bench('inc() with labels', () => {
      counter.inc({ method: 'GET', path: '/api' });
    }).run();
  });

  test('add()', async ({ bench }) => {
    await bench('add()', () => {
      counter.add(10, { method: 'POST' });
    }).run();
  });
});

describe('gauge', () => {
  const registry = new Registry();
  const gauge = registry.create('gauge', 'test_gauge', 'Test gauge');

  test('inc()', async ({ bench }) => {
    await bench('inc()', () => {
      gauge.inc();
    }).run();
  });

  test('set()', async ({ bench }) => {
    await bench('set()', () => {
      gauge.set(42, { status: 'active' });
    }).run();
  });
});

describe('histogram', () => {
  const registry = new Registry();
  const histogram = registry.create('histogram', 'test_histogram', 'Test histogram');

  test('observe()', async ({ bench }) => {
    await bench('observe()', () => {
      histogram.observe(Math.random() * 100);
    }).run();
  });

  test('observe() with labels', async ({ bench }) => {
    await bench('observe() with labels', () => {
      histogram.observe(Math.random() * 100, { method: 'GET' });
    }).run();
  });
});

describe('registry', () => {
  test('full flow: create + record + output', async ({ bench }) => {
    await bench('full flow: create + record + output', () => {
      const registry = new Registry({ defaultLabels: { env: 'test' } });
      const counter = registry.create('counter', 'req_total', 'Requests');
      const histogram = registry.create('histogram', 'req_duration', 'Duration');

      counter.inc({ method: 'GET' });
      counter.add(5, { method: 'POST' });
      histogram.observe(50, { path: '/api' });

      registry.metrics();
    }).run();
  });

  const registryForMetrics = new Registry({ defaultLabels: { env: 'test' } });
  const counterForMetrics = registryForMetrics.create('counter', 'req_total', 'Requests');
  const histogramForMetrics = registryForMetrics.create('histogram', 'req_duration', 'Duration');
  counterForMetrics.inc({ method: 'GET' });
  counterForMetrics.add(5, { method: 'POST' });
  histogramForMetrics.observe(50, { path: '/api' });

  test('metrics() prometheus', async ({ bench }) => {
    await bench('metrics() prometheus', () => {
      registryForMetrics.metrics();
    }).run();
  });

  test('metrics() openmetrics', async ({ bench }) => {
    await bench('metrics() openmetrics', () => {
      registryForMetrics.metrics({ format: 'openmetrics' });
    }).run();
  });

  test('reset()', async ({ bench }) => {
    await bench('reset()', () => {
      const registry = new Registry();
      const counter = registry.create('counter', 'c', 'c');
      counter.inc();
      registry.reset();
    }).run();
  });
});
