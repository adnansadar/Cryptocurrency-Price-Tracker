import { describe, expect, it } from "vitest";
import { formatCurrency, formatPercent } from "./format";

describe("financial formatting", () => {
  it("retains precision for sub-unit prices", () => {
    expect(formatCurrency(0.009321, "usd")).toContain("0.009321");
  });

  it("uses explicit signs for movement", () => {
    expect(formatPercent(2.4)).toBe("+2.40%");
    expect(formatPercent(-2.4)).toBe("-2.40%");
  });

  it("formats missing values consistently", () => {
    expect(formatCurrency(null, "usd")).toBe("—");
  });
});
