import { describe, expect, it } from "vitest";
import { HybridCache } from "./cache.js";

describe("HybridCache memory fallback", () => {
  it("returns live values and expires stale values", async () => {
    const cache = new HybridCache(2);
    await cache.set("short", { ok: true }, 0.001);
    expect(await cache.get("short")).toEqual({ ok: true });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(await cache.get("short")).toBeNull();
  });

  it("evicts the least-recently-used entry", async () => {
    const cache = new HybridCache(2);
    await cache.set("one", 1, 10);
    await cache.set("two", 2, 10);
    await cache.get("one");
    await cache.set("three", 3, 10);
    expect(await cache.get("two")).toBeNull();
    expect(await cache.get("one")).toBe(1);
  });
});
