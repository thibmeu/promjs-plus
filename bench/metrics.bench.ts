import { bench, describe } from 'vitest';
import { Registry } from '../src/index';

describe('counter', () => {
  const registry = new Registry();
  const counter = registry.create('counter', 'test_counter', 'Test counter');

  bench('inc() no labels', () => {
    counter.inc();
  });

  bench('inc() with labels', () => {
    counter.inc({ method: 'GET', path: '/api' });
  });

  bench('add()', () => {
    counter.add(10, { method: 'POST' });
  });
});

describe('gauge', () => {
  const registry = new Registry();
  const gauge = registry.create('gauge', 'test_gauge', 'Test gauge');

  bench('inc()', () => {
    gauge.inc();
  });

  bench('set()', () => {
    gauge.set(42, { status: 'active' });
  });
});

describe('histogram', () => {
  const registry = new Registry();
  const histogram = registry.create('histogram', 'test_histogram', 'Test histogram');

  bench('observe()', () => {
    histogram.observe(Math.random() * 100);
  });

  bench('observe() with labels', () => {
    histogram.observe(Math.random() * 100, { method: 'GET' });
  });
});

describe('registry', () => {
  bench('metrics() output', () => {
    const registry = new Registry({ defaultLabels: { env: 'test' } });
    const counter = registry.create('counter', 'req_total', 'Requests');
    const histogram = registry.create('histogram', 'req_duration', 'Duration');

    counter.inc({ method: 'GET' });
    counter.add(5, { method: 'POST' });
    histogram.observe(50, { path: '/api' });

    registry.metrics();
  });

  bench('reset()', () => {
    const registry = new Registry();
    const counter = registry.create('counter', 'c', 'c');
    counter.inc();
    registry.reset();
  });
});
