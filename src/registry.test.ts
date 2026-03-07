import { beforeEach, describe, expect, it } from "vitest";
import { Collector } from "./collector";
import { Counter } from "./counter";
import { Registry } from "./registry";

describe("Registry", () => {
  let registry: Registry;
  let counter: Counter;

  beforeEach(() => {
    registry = new Registry();
    counter = registry.create("counter", "my_counter", "A counter for things");
  });

  it("renders metrics to prometheus format", () => {
    let desired = "# HELP my_counter A counter for things\n";
    desired += "# TYPE my_counter counter\n";
    desired += "my_counter 5\n";

    counter.add(5);
    expect(registry.metrics()).equals(desired);
  });

  it("renders metrics with labels to prometheus format", () => {
    let desired = "# HELP my_counter A counter for things\n";
    desired += "# TYPE my_counter counter\n";
    desired += 'my_counter{path="/org/:orgId",foo="bar"} 10\n';

    counter.add(10, { path: "/org/:orgId", foo: "bar" });
    expect(registry.metrics()).equals(desired);
  });

  it("clear all the metrics", () => {
    counter.inc();
    registry.clear();
    expect(registry.metrics()).equals("");
  });

  it("reset all the metrics", () => {
    counter.inc();
    registry.reset();
    expect(registry.metrics()).contains("my_counter 0");
    counter.inc();
    expect(registry.metrics()).contains("my_counter 1");
  });

  it("gets a metric by name and type", () => {
    const metric = registry.get("counter", "my_counter");
    expect(metric).instanceof(Collector);
  });

  it("prevents naming collisions", () => {
    const dupe = (): void => {
      registry.create("counter", "counter_a");
      registry.create("counter", "counter_a");
    };
    expect(dupe).throw();
  });

  describe("default labels", () => {
    it("applies default labels via constructor", () => {
      const reg = new Registry({ defaultLabels: { env: "prod", region: "us" } });
      const c = reg.create("counter", "requests", "");
      c.inc();
      expect(reg.metrics()).contains('requests{env="prod",region="us"} 1');
    });

    it("applies default labels via setDefaultLabels", () => {
      const reg = new Registry();
      reg.setDefaultLabels({ service: "api" });
      const c = reg.create("counter", "requests", "");
      c.inc();
      expect(reg.metrics()).contains('requests{service="api"} 1');
    });

    it("metric labels override default labels", () => {
      const reg = new Registry({ defaultLabels: { env: "prod" } });
      const c = reg.create("counter", "requests", "");
      c.inc({ env: "staging", path: "/" });
      // metric's env="staging" overrides default env="prod"
      expect(reg.metrics()).contains('requests{env="staging",path="/"} 1');
    });

    it("returns default labels via getDefaultLabels", () => {
      const reg = new Registry({ defaultLabels: { foo: "bar" } });
      expect(reg.getDefaultLabels()).deep.equals({ foo: "bar" });
    });

    it("applies default labels to histograms", () => {
      const reg = new Registry({ defaultLabels: { env: "test" } });
      const h = reg.create("histogram", "latency", "", [100, 500]);
      h.observe(50);
      const output = reg.metrics();
      expect(output).contains('latency_count{env="test"} 1');
      expect(output).contains('latency_sum{env="test"} 50');
      expect(output).contains('latency_bucket{le="100",env="test"} 1');
    });
  });
});
