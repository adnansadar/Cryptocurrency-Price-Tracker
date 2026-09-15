import { describe, expect, it } from "vitest";
import { marketSearchParams } from "./api";

describe("market URL state", () => {
  it("omits empty filters and serializes active filters", () => {
    const params = marketSearchParams({
      currency: "usd",
      search: "bitcoin",
      category: "",
      minVolume: 1_000_000,
    });
    expect(params.toString()).toBe(
      "currency=usd&search=bitcoin&minVolume=1000000",
    );
  });
});
