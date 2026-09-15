import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it("keeps relative application routes", () => {
    expect(safeReturnTo("/coin/bitcoin?currency=usd#chart")).toBe(
      "/coin/bitcoin?currency=usd#chart",
    );
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safeReturnTo("https://example.com/phishing")).toBe("/workspace");
    expect(safeReturnTo("//example.com/phishing")).toBe("/workspace");
  });
});
