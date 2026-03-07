import { beforeEach, describe, expect, it } from "vitest";
import { Histogram } from "./histogram";

const buckets = [200, 400, 750, 1000];

describe("Histogram", () => {
  let histogram: Histogram;

  beforeEach(() => {
    histogram = new Histogram(buckets);
  });

  it("observes some values", () => {
    histogram.observe(380);  // -> 400 bucket
    histogram.observe(400);  // -> 400 bucket
    histogram.observe(199);  // -> 200 bucket
    histogram.observe(1200); // -> +Inf bucket
    const result = histogram.collect();

    expect(result.length).equals(1);
    expect(result[0].value).contains({
      sum: 2179,
      count: 4,
    });

    // Raw (non-cumulative) bucket counts - cumulative computed at export
    expect(result[0].value.entries).deep.equals({
      200: 1,
      400: 2,
      750: 0,
      1000: 0,
      "+Inf": 1,
    });
  });

  it("clears observed values", () => {
    histogram.observe(380);
    histogram.observe(400);
    histogram.observe(199);
    histogram.reset();

    const result = histogram.collect();
    expect(result).deep.equal([
      {
        labels: undefined,
        value: {
          sum: 0,
          count: 0,
          entries: {
            200: 0,
            400: 0,
            750: 0,
            1000: 0,
            "+Inf": 0,
          },
        },
      },
    ]);
    expect(result.length).equals(1);
  });
});
