import { describe, expect, it } from "vitest";
import {
  annualizedVolatility,
  calculateReturns,
  correlation,
  historyForRange,
  maximumDrawdown,
} from "./analytics.js";

const points = [
  { timestamp: 1, price: 100, marketCap: null, volume: 10 },
  { timestamp: 2, price: 120, marketCap: null, volume: 20 },
  { timestamp: 3, price: 90, marketCap: null, volume: 30 },
];

describe("market analytics", () => {
  it("normalizes a series against its first observation", () => {
    const normalized = calculateReturns(points);
    const returns = normalized.map((point) => point.normalizedReturn);
    expect(returns[0]).toBe(0);
    expect(returns[1]).toBeCloseTo(20);
    expect(returns[2]).toBeCloseTo(-10);
    expect(normalized[0]?.volume).toBe(10);
    expect(normalized[0]?.marketCap).toBeNull();
  });

  it("calculates maximum peak-to-trough drawdown", () => {
    expect(maximumDrawdown(points)).toBe(-25);
  });

  it("returns a perfect correlation for matching returns", () => {
    expect(correlation([0.1, -0.2, 0.3], [0.1, -0.2, 0.3])).toBeCloseTo(1);
  });

  it("handles insufficient volatility data", () => {
    expect(annualizedVolatility([])).toBe(0);
  });

  it("derives shorter ranges from a shared history series", () => {
    const day = 86_400_000;
    const history = Array.from({ length: 366 }, (_, index) => ({
      timestamp: index * day,
      price: 100 + index,
      marketCap: null,
      volume: null,
    }));

    expect(historyForRange(history, "7")).toHaveLength(8);
    expect(historyForRange(history, "30")).toHaveLength(31);
    expect(historyForRange(history, "90")).toHaveLength(91);
    expect(historyForRange(history, "365")).toHaveLength(366);
  });
});
