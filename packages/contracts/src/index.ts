import { z } from "zod";

export const currencies = [
  "usd",
  "inr",
  "eur",
  "gbp",
  "cad",
  "jpy",
  "aud",
  "chf",
] as const;
export const currencySchema = z.enum(currencies);
export type Currency = z.infer<typeof currencySchema>;

export const marketSortKeys = [
  "market_cap",
  "current_price",
  "price_change_percentage_24h",
  "total_volume",
  "ath_distance",
] as const;
export type MarketSortKey = (typeof marketSortKeys)[number];

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().finite().optional(),
);

export const marketQuerySchema = z.object({
  currency: currencySchema.default("usd"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(10).max(100).default(25),
  search: z.string().trim().max(80).default(""),
  category: z.string().trim().max(120).default(""),
  ids: z.string().trim().max(2_000).default(""),
  minMarketCap: optionalNumber,
  maxMarketCap: optionalNumber,
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  minVolume: optionalNumber,
  minChange: optionalNumber,
  maxChange: optionalNumber,
  maxAthDistance: optionalNumber,
  sort: z.enum(marketSortKeys).default("market_cap"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});
export type MarketQuery = z.infer<typeof marketQuerySchema>;

export const marketCoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  currentPrice: z.number().nullable(),
  marketCap: z.number().nullable(),
  marketCapRank: z.number().nullable(),
  totalVolume: z.number().nullable(),
  high24h: z.number().nullable(),
  low24h: z.number().nullable(),
  change24h: z.number().nullable(),
  change7d: z.number().nullable(),
  change30d: z.number().nullable(),
  ath: z.number().nullable(),
  athDistance: z.number().nullable(),
  lastUpdated: z.string(),
});
export type MarketCoin = z.infer<typeof marketCoinSchema>;

export const marketOverviewSchema = z.object({
  totalMarketCap: z.number(),
  totalVolume: z.number(),
  bitcoinDominance: z.number(),
  advancing: z.number(),
  declining: z.number(),
  unchanged: z.number(),
});
export type MarketOverview = z.infer<typeof marketOverviewSchema>;

export const marketResponseSchema = z.object({
  data: z.array(marketCoinSchema),
  overview: marketOverviewSchema,
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  meta: z.object({
    currency: currencySchema,
    updatedAt: z.string(),
    stale: z.boolean(),
    cache: z.enum(["hit", "miss"]),
  }),
});
export type MarketResponse = z.infer<typeof marketResponseSchema>;

export const coinListItemSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
});
export type CoinListItem = z.infer<typeof coinListItemSchema>;

export const coinListResponseSchema = z.object({
  data: z.array(coinListItemSchema),
});
export type CoinListResponse = z.infer<typeof coinListResponseSchema>;

export const ranges = ["7", "30", "90", "365"] as const;
export const rangeSchema = z.enum(ranges);
export type ChartRange = z.infer<typeof rangeSchema>;

export const historyPointSchema = z.object({
  timestamp: z.number(),
  price: z.number(),
  marketCap: z.number().nullable(),
  volume: z.number().nullable(),
});
export type HistoryPoint = z.infer<typeof historyPointSchema>;

export const ohlcPointSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});
export type OhlcPoint = z.infer<typeof ohlcPointSchema>;

export const coinDetailSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  description: z.string(),
  homepage: z.string().url().nullable(),
  categories: z.array(z.string()),
  genesisDate: z.string().nullable(),
  hashingAlgorithm: z.string().nullable(),
  marketCapRank: z.number().nullable(),
  currentPrice: z.number().nullable(),
  marketCap: z.number().nullable(),
  totalVolume: z.number().nullable(),
  circulatingSupply: z.number().nullable(),
  totalSupply: z.number().nullable(),
  maxSupply: z.number().nullable(),
  ath: z.number().nullable(),
  athDate: z.string().nullable(),
  atl: z.number().nullable(),
  atlDate: z.string().nullable(),
  change24h: z.number().nullable(),
  lastUpdated: z.string(),
});
export type CoinDetail = z.infer<typeof coinDetailSchema>;

export const comparisonAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string().url(),
  points: z.array(
    z.object({
      timestamp: z.number(),
      price: z.number(),
      marketCap: z.number().nullable(),
      volume: z.number().nullable(),
      normalizedReturn: z.number(),
    }),
  ),
  metrics: z.object({
    totalReturn: z.number(),
    annualizedVolatility: z.number(),
    maxDrawdown: z.number(),
    averageVolume: z.number(),
    correlationToFirst: z.number().nullable(),
  }),
});
export type ComparisonAsset = z.infer<typeof comparisonAssetSchema>;

export const compareResponseSchema = z.object({
  assets: z.array(comparisonAssetSchema),
  range: rangeSchema,
  currency: currencySchema,
  updatedAt: z.string(),
});
export type CompareResponse = z.infer<typeof compareResponseSchema>;

export const authCapabilitiesSchema = z.object({
  enabled: z.boolean(),
  emailPassword: z.boolean(),
  google: z.boolean(),
});
export type AuthCapabilities = z.infer<typeof authCapabilitiesSchema>;

export const watchlistItemSchema = z.object({
  id: z.string(),
  coinId: z.string(),
  createdAt: z.string(),
});
export type WatchlistItem = z.infer<typeof watchlistItemSchema>;

export const watchlistSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(80),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(watchlistItemSchema),
});
export type Watchlist = z.infer<typeof watchlistSchema>;

export const watchlistsResponseSchema = z.object({
  data: z.array(watchlistSchema),
});

export const primaryWatchlistResponseSchema = z.object({
  data: z.array(z.string()),
});

export const savedScreenSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(80),
  query: z.record(z.string(), z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SavedScreen = z.infer<typeof savedScreenSchema>;
export const savedScreensResponseSchema = z.object({
  data: z.array(savedScreenSchema),
});

export const researchNoteSchema = z.object({
  coinId: z.string(),
  body: z.string().max(5_000),
  updatedAt: z.string(),
});
export type ResearchNote = z.infer<typeof researchNoteSchema>;
export const researchNotesResponseSchema = z.object({
  data: z.array(researchNoteSchema),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
