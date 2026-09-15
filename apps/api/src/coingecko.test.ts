import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrencyRate, getMarkets } from "./coingecko.js";

describe("CoinGecko gateway", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes upstream rate limits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 429 })),
    );
    await expect(getMarkets("usd", "rate-limit-fixture")).rejects.toMatchObject(
      { code: "PROVIDER_RATE_LIMITED", status: 503 },
    );
  });

  it("serves repeated provider requests from cache", async () => {
    const payload = [
      {
        id: "fixture",
        symbol: "fix",
        name: "Fixture",
        image: "https://example.com/coin.png",
        current_price: 1,
        market_cap: 100,
        market_cap_rank: 1,
        total_volume: 10,
        high_24h: 2,
        low_24h: 1,
        price_change_percentage_24h: 1,
        ath: 3,
        ath_change_percentage: -66,
        last_updated: new Date().toISOString(),
      },
    ];
    const provider = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );
    vi.stubGlobal("fetch", provider);
    const first = await getMarkets("usd", "cache-fixture");
    const second = await getMarkets("usd", "cache-fixture");
    expect(first.cacheStatus).toBe("miss");
    expect(second.cacheStatus).toBe("hit");
    expect(provider).toHaveBeenCalledTimes(1);
  });

  it("derives currency conversion from a cached reference price", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            market_data: { current_price: { usd: 100, inr: 8_300 } },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getCurrencyRate("currency-rate-fixture", "inr")).resolves.toBe(
      83,
    );
  });
});
