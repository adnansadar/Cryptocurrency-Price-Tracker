import { describe, expect, it } from "vitest";
import { marketSearchParams, resolveApiBaseUrl } from "./api";

describe("API routing", () => {
  it("uses same-origin proxy paths in the browser", () => {
    expect(
      resolveApiBaseUrl("https://api.example.com", true),
    ).toBe("");
  });

  it("uses the backend URL during server rendering", () => {
    expect(
      resolveApiBaseUrl("https://api.example.com", false),
    ).toBe("https://api.example.com");
  });
});

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
