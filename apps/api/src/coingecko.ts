import {
  type CoinDetail,
  type Currency,
  type HistoryPoint,
  type MarketCoin,
  type OhlcPoint,
} from "@crypto-terminal/contracts";
import { cache } from "./cache.js";
import { config } from "./config.js";
import { ProviderException } from "./errors.js";

type ProviderMarket = Record<string, unknown>;
type JsonRecord = Record<string, any>;

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function plainText(html: string) {
  return html
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const coinDetailParams = {
  localization: "false",
  tickers: "false",
  market_data: "true",
  community_data: "false",
  developer_data: "false",
};

async function providerFetch<T>(
  path: string,
  params: Record<string, string>,
  ttlSeconds: number,
): Promise<{ data: T; cache: "hit" | "miss" }> {
  const query = new URLSearchParams(params);
  const key = `cg:${path}?${query}`;
  const cached = await cache.get<T>(key);
  if (cached) return { data: cached, cache: "hit" };

  const headers: Record<string, string> = { accept: "application/json" };
  if (config.coinGeckoApiKey)
    headers["x-cg-demo-api-key"] = config.coinGeckoApiKey;
  const response = await fetch(`${config.coinGeckoUrl}${path}?${query}`, {
    headers,
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);

  if (!response?.ok) throw new ProviderException(response?.status ?? 502);
  const data = (await response.json()) as T;
  await cache.set(key, data, ttlSeconds);
  return { data, cache: "miss" };
}

export async function getMarkets(currency: Currency, category = "") {
  const params: Record<string, string> = {
    vs_currency: currency,
    order: "market_cap_desc",
    per_page: "250",
    page: "1",
    sparkline: "false",
    price_change_percentage: "7d,30d",
  };
  if (category) params.category = category;
  const result = await providerFetch<ProviderMarket[]>(
    "/coins/markets",
    params,
    55,
  );
  const coins: MarketCoin[] = result.data.map((raw) => {
    const athChange = finite(raw.ath_change_percentage);
    return {
      id: String(raw.id),
      symbol: String(raw.symbol),
      name: String(raw.name),
      image: String(raw.image),
      currentPrice: finite(raw.current_price),
      marketCap: finite(raw.market_cap),
      marketCapRank: finite(raw.market_cap_rank),
      totalVolume: finite(raw.total_volume),
      high24h: finite(raw.high_24h),
      low24h: finite(raw.low_24h),
      change24h: finite(raw.price_change_percentage_24h),
      change7d: finite(raw.price_change_percentage_7d_in_currency),
      change30d: finite(raw.price_change_percentage_30d_in_currency),
      ath: finite(raw.ath),
      athDistance: athChange === null ? null : Math.abs(Math.min(0, athChange)),
      lastUpdated:
        typeof raw.last_updated === "string"
          ? raw.last_updated
          : new Date().toISOString(),
    };
  });
  return { coins, cacheStatus: result.cache };
}

export async function getCategories() {
  return providerFetch<Array<{ category_id: string; name: string }>>(
    "/coins/categories/list",
    {},
    86_400,
  );
}

async function getRawCoinDetail(id: string) {
  return providerFetch<JsonRecord>(
    `/coins/${encodeURIComponent(id)}`,
    coinDetailParams,
    300,
  );
}

export async function getCurrencyRate(id: string, currency: Currency) {
  if (currency === "usd") return 1;
  const { data } = await getRawCoinDetail(id);
  const usdPrice = finite(data.market_data?.current_price?.usd);
  const currencyPrice = finite(data.market_data?.current_price?.[currency]);
  return usdPrice && currencyPrice ? currencyPrice / usdPrice : 1;
}

export async function getCoinDetail(
  id: string,
  currency: Currency,
): Promise<CoinDetail> {
  const { data } = await getRawCoinDetail(id);
  const market = data.market_data ?? {};
  return {
    id: String(data.id),
    symbol: String(data.symbol),
    name: String(data.name),
    image: String(data.image?.large ?? data.image?.small),
    description: plainText(String(data.description?.en ?? "")),
    homepage:
      data.links?.homepage?.find(
        (link: unknown) => typeof link === "string" && link.startsWith("http"),
      ) ?? null,
    categories: Array.isArray(data.categories)
      ? data.categories.filter(Boolean)
      : [],
    genesisDate: data.genesis_date ?? null,
    hashingAlgorithm: data.hashing_algorithm ?? null,
    marketCapRank: finite(data.market_cap_rank),
    currentPrice: finite(market.current_price?.[currency]),
    marketCap: finite(market.market_cap?.[currency]),
    totalVolume: finite(market.total_volume?.[currency]),
    circulatingSupply: finite(market.circulating_supply),
    totalSupply: finite(market.total_supply),
    maxSupply: finite(market.max_supply),
    ath: finite(market.ath?.[currency]),
    athDate: market.ath_date?.[currency] ?? null,
    atl: finite(market.atl?.[currency]),
    atlDate: market.atl_date?.[currency] ?? null,
    change24h: finite(market.price_change_percentage_24h),
    lastUpdated: data.last_updated ?? new Date().toISOString(),
  };
}

export async function getHistory(
  id: string,
  currency: Currency,
  days: string,
): Promise<HistoryPoint[]> {
  const { data } = await providerFetch<JsonRecord>(
    `/coins/${encodeURIComponent(id)}/market_chart`,
    {
      vs_currency: currency,
      days,
    },
    300,
  );
  const caps = new Map<number, number>(
    (data.market_caps ?? []).map(([time, value]: [number, number]) => [
      time,
      value,
    ]),
  );
  const volumes = new Map<number, number>(
    (data.total_volumes ?? []).map(([time, value]: [number, number]) => [
      time,
      value,
    ]),
  );
  return (data.prices ?? []).map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price,
    marketCap: caps.get(timestamp) ?? null,
    volume: volumes.get(timestamp) ?? null,
  }));
}

export async function getOhlc(
  id: string,
  currency: Currency,
  days: string,
): Promise<OhlcPoint[]> {
  const { data } = await providerFetch<number[][]>(
    `/coins/${encodeURIComponent(id)}/ohlc`,
    {
      vs_currency: currency,
      days,
    },
    300,
  );
  return data.map(([timestamp, open, high, low, close]) => ({
    timestamp: timestamp ?? 0,
    open: open ?? 0,
    high: high ?? 0,
    low: low ?? 0,
    close: close ?? 0,
  }));
}
