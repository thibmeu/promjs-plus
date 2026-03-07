import { Collector } from "./collector";
import { CounterValue, Labels } from "./types";

export class Counter extends Collector<CounterValue> {
  inc(labels?: Labels): this {
    return this.add(1, labels);
  }

  add(amount: number, labels?: Labels): this {
    if (amount < 0) {
      throw new Error(
        `Expected increment amount to be greater than -1. Received: ${amount}`,
      );
    }
    const metric = this.get(labels);
    if (metric) {
      metric.value += amount;
    } else {
      this.set(amount, labels);
    }
    return this;
  }

  reset(labels?: Labels): void {
    this.set(0, labels);
  }
}
