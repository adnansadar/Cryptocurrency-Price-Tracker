import { Router } from "express";
import {
  currencySchema,
  marketQuerySchema,
  rangeSchema,
} from "@crypto-terminal/contracts";
import {
  buildMetrics,
  calculateReturns,
  dailyReturns,
  historyForRange,
} from "./analytics.js";
import {
  getCategories,
  getCoinDetail,
  getCurrencyRate,
  getHistory,
  getMarkets,
  getOhlc,
} from "./coingecko.js";
import { ApiException } from "./errors.js";

function valueForSort(
  coin: Awaited<ReturnType<typeof getMarkets>>["coins"][number],
  key: string,
) {
  const fields = {
    market_cap: coin.marketCap,
    current_price: coin.currentPrice,
    price_change_percentage_24h: coin.change24h,
    total_volume: coin.totalVolume,
    ath_distance: coin.athDistance,
  };
  return fields[key as keyof typeof fields] ?? null;
}

export const marketRouter = Router();

marketRouter.get("/markets", async (request, response) => {
  const parsed = marketQuerySchema.safeParse(request.query);
  if (!parsed.success)
    throw new ApiException(
      400,
      "INVALID_QUERY",
      "The market filters are invalid",
      parsed.error.flatten(),
    );
  const query = parsed.data;
  const { coins, cacheStatus } = await getMarkets(
    query.currency,
    query.category,
  );
  const overview = {
    totalMarketCap: coins.reduce((sum, coin) => sum + (coin.marketCap ?? 0), 0),
    totalVolume: coins.reduce((sum, coin) => sum + (coin.totalVolume ?? 0), 0),
    bitcoinDominance: (() => {
      const total = coins.reduce((sum, coin) => sum + (coin.marketCap ?? 0), 0);
      const bitcoin =
        coins.find((coin) => coin.id === "bitcoin")?.marketCap ?? 0;
      return total ? (bitcoin / total) * 100 : 0;
    })(),
    advancing: coins.filter((coin) => (coin.change24h ?? 0) > 0).length,
    declining: coins.filter((coin) => (coin.change24h ?? 0) < 0).length,
    unchanged: coins.filter((coin) => !coin.change24h).length,
  };
  const search = query.search.toLowerCase();
  const selectedIds = new Set(query.ids.split(",").filter(Boolean));
  const filtered = coins
    .filter((coin) => {
      const searchable = `${coin.name} ${coin.symbol}`.toLowerCase();
      return (
        (!search || searchable.includes(search)) &&
        (!selectedIds.size || selectedIds.has(coin.id)) &&
        (query.minMarketCap === undefined ||
          (coin.marketCap ?? -Infinity) >= query.minMarketCap) &&
        (query.maxMarketCap === undefined ||
          (coin.marketCap ?? Infinity) <= query.maxMarketCap) &&
        (query.minPrice === undefined ||
          (coin.currentPrice ?? -Infinity) >= query.minPrice) &&
        (query.maxPrice === undefined ||
          (coin.currentPrice ?? Infinity) <= query.maxPrice) &&
        (query.minVolume === undefined ||
          (coin.totalVolume ?? -Infinity) >= query.minVolume) &&
        (query.minChange === undefined ||
          (coin.change24h ?? -Infinity) >= query.minChange) &&
        (query.maxChange === undefined ||
          (coin.change24h ?? Infinity) <= query.maxChange) &&
        (query.maxAthDistance === undefined ||
          (coin.athDistance ?? Infinity) <= query.maxAthDistance)
      );
    })
    .sort((left, right) => {
      const a = valueForSort(left, query.sort);
      const b = valueForSort(right, query.sort);
      if (a === null) return 1;
      if (b === null) return -1;
      return query.direction === "asc" ? a - b : b - a;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / query.perPage));
  const page = Math.min(query.page, totalPages);
  response.json({
    data: filtered.slice((page - 1) * query.perPage, page * query.perPage),
    overview,
    pagination: {
      page,
      perPage: query.perPage,
      total: filtered.length,
      totalPages,
    },
    meta: {
      currency: query.currency,
      updatedAt: new Date().toISOString(),
      stale: false,
      cache: cacheStatus,
    },
  });
});

marketRouter.get("/categories", async (_request, response) => {
  const { data } = await getCategories();
  response.json({ data: data.sort((a, b) => a.name.localeCompare(b.name)) });
});

marketRouter.get("/coins/list", async (_request, response) => {
  const { coins } = await getMarkets("usd");
  response.json({
    data: coins.map(({ id, symbol, name }) => ({ id, symbol, name })),
  });
});

marketRouter.get("/coins/:coinId", async (request, response) => {
  const currency = currencySchema.catch("usd").parse(request.query.currency);
  response.json(await getCoinDetail(request.params.coinId, currency));
});

marketRouter.get("/coins/:coinId/history", async (request, response) => {
  const currency = currencySchema.catch("usd").parse(request.query.currency);
  const range = rangeSchema.catch("30").parse(request.query.range);
  response.json({
    data: await getHistory(request.params.coinId, currency, range),
    range,
    currency,
  });
});

marketRouter.get("/coins/:coinId/ohlc", async (request, response) => {
  const currency = currencySchema.catch("usd").parse(request.query.currency);
  const range = rangeSchema.catch("30").parse(request.query.range);
  response.json({
    data: await getOhlc(request.params.coinId, currency, range),
    range,
    currency,
  });
});

marketRouter.get("/compare", async (request, response) => {
  const currency = currencySchema.catch("usd").parse(request.query.currency);
  const range = rangeSchema.catch("30").parse(request.query.range);
  const ids = String(request.query.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length < 2 || ids.length > 4 || new Set(ids).size !== ids.length) {
    throw new ApiException(
      400,
      "INVALID_COMPARISON",
      "Choose between two and four unique coin IDs",
    );
  }
  const referenceDetail = await getCoinDetail(ids[0]!, currency);
  const currencyRate = await getCurrencyRate(ids[0]!, currency);
  const results = await Promise.all(
    ids.map(async (id, index) => {
      const [detail, points] = await Promise.all([
        index === 0 ? referenceDetail : getCoinDetail(id, currency),
        getHistory(id, "usd", "365"),
      ]);
      return {
        detail,
        points: historyForRange(points, range).map((point) => ({
          ...point,
          price: point.price * currencyRate,
          marketCap:
            point.marketCap === null ? null : point.marketCap * currencyRate,
          volume: point.volume === null ? null : point.volume * currencyRate,
        })),
      };
    }),
  );
  const referenceReturns = dailyReturns(results[0]!.points);
  response.json({
    assets: results.map(({ detail, points }, index) => ({
      id: detail.id,
      name: detail.name,
      symbol: detail.symbol,
      image: detail.image,
      points: calculateReturns(points),
      metrics: buildMetrics(points, index === 0 ? undefined : referenceReturns),
    })),
    range,
    currency,
    updatedAt: new Date().toISOString(),
  });
});
