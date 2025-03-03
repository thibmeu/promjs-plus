import { beforeEach, describe, expect, it } from "vitest";
import { Counter } from "./counter";

describe("Counter", () => {
  let counter: Counter;

  beforeEach(() => {
    counter = new Counter();
  });

  it("increments a value", () => {
    expect(counter.inc().collect()).deep.equal([
      {
        value: 1,
        labels: undefined,
      },
    ]);
  });

  it("adds a value", () => {
    const value = 5;

    expect(counter.add(value).collect()).deep.equal([
      {
        value,
        labels: undefined,
      },
    ]);
  });

  it("increments a value with labels", () => {
    counter.inc({ path: "/foo/bar", status: "fail" });

    expect(counter.collect({ path: "/foo/bar", status: "fail" })).deep.equal([
      {
        labels: {
          path: "/foo/bar",
          status: "fail",
        },
        value: 1,
      },
    ]);
  });

  it("ensures value is >= 0", () => {
    const value = -5;
    const inc = counter.add.bind(counter, value);

    expect(inc).throw();
  });

  it("resets all data", () => {
    counter.inc({ path: "/foo/bar", status: "fail" });
    counter.resetAll();

    expect(counter.collect({ path: "/foo/bar", status: "fail" })).deep.equal([
      {
        labels: {
          path: "/foo/bar",
          status: "fail",
        },
        value: 0,
      },
    ]);
  });
});
