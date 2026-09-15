import {
  authCapabilitiesSchema,
  coinDetailSchema,
  coinListResponseSchema,
  compareResponseSchema,
  marketResponseSchema,
  primaryWatchlistResponseSchema,
  researchNoteSchema,
  researchNotesResponseSchema,
  savedScreenSchema,
  savedScreensResponseSchema,
  watchlistItemSchema,
  watchlistSchema,
  watchlistsResponseSchema,
  type ChartRange,
  type Currency,
  type HistoryPoint,
  type MarketQuery,
  type OhlcPoint,
} from "@crypto-terminal/contracts";
import { z } from "zod";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new ApiClientError(
      response.status,
      payload?.error?.message ?? "The research service is unavailable",
    );
  }
  return schema.parse(await response.json());
}

async function requestWithoutBody(path: string, init: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new ApiClientError(
      response.status,
      payload?.error?.message ?? "The research service is unavailable",
    );
  }
}

const jsonHeaders = { "content-type": "application/json" };

export function marketSearchParams(query: Partial<MarketQuery>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params;
}

export function getMarkets(query: Partial<MarketQuery> = {}) {
  return request(
    `/v1/markets?${marketSearchParams(query)}`,
    marketResponseSchema,
    { next: { revalidate: 45 } },
  );
}

export function getCategories() {
  return request(
    "/v1/categories",
    z.object({
      data: z.array(z.object({ category_id: z.string(), name: z.string() })),
    }),
    { next: { revalidate: 86_400 } },
  );
}

export function getCoinList() {
  return request("/v1/coins/list", coinListResponseSchema, {
    next: { revalidate: 86_400 },
  });
}

export function getCoin(coinId: string, currency: Currency) {
  return request(
    `/v1/coins/${encodeURIComponent(coinId)}?currency=${currency}`,
    coinDetailSchema,
    { next: { revalidate: 300 } },
  );
}

export function getHistory(
  coinId: string,
  currency: Currency,
  range: ChartRange,
) {
  return request(
    `/v1/coins/${encodeURIComponent(coinId)}/history?currency=${currency}&range=${range}`,
    z.object({
      data: z.array(
        z.object({
          timestamp: z.number(),
          price: z.number(),
          marketCap: z.number().nullable(),
          volume: z.number().nullable(),
        }),
      ),
    }),
  ).then((result) => result.data as HistoryPoint[]);
}

export function getOhlc(coinId: string, currency: Currency, range: ChartRange) {
  return request(
    `/v1/coins/${encodeURIComponent(coinId)}/ohlc?currency=${currency}&range=${range}`,
    z.object({
      data: z.array(
        z.object({
          timestamp: z.number(),
          open: z.number(),
          high: z.number(),
          low: z.number(),
          close: z.number(),
        }),
      ),
    }),
  ).then((result) => result.data as OhlcPoint[]);
}

export function getComparison(
  ids: string[],
  currency: Currency,
  range: ChartRange,
) {
  return request(
    `/v1/compare?ids=${ids.map(encodeURIComponent).join(",")}&currency=${currency}&range=${range}`,
    compareResponseSchema,
  );
}

export function getAuthCapabilities() {
  return request("/v1/auth/capabilities", authCapabilitiesSchema);
}

export function getPrimaryWatchlist() {
  return request("/v1/watchlist", primaryWatchlistResponseSchema).then(
    (result) => result.data,
  );
}

export function addPrimaryWatchlistItem(coinId: string) {
  return request(
    `/v1/watchlist/${encodeURIComponent(coinId)}`,
    watchlistItemSchema,
    { method: "PUT" },
  );
}

export function removePrimaryWatchlistItem(coinId: string) {
  return requestWithoutBody(`/v1/watchlist/${encodeURIComponent(coinId)}`, {
    method: "DELETE",
  });
}

export function getWatchlists() {
  return request("/v1/watchlists", watchlistsResponseSchema).then(
    (result) => result.data,
  );
}

export function createWatchlist(name: string) {
  return request("/v1/watchlists", watchlistSchema, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
}

export function deleteWatchlist(id: string) {
  return requestWithoutBody(`/v1/watchlists/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function addWatchlistItem(listId: string, coinId: string) {
  return request(
    `/v1/watchlists/${encodeURIComponent(listId)}/items`,
    watchlistItemSchema,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ coinId }),
    },
  );
}

export function getSavedScreens() {
  return request("/v1/saved-screens", savedScreensResponseSchema).then(
    (result) => result.data,
  );
}

export function createSavedScreen(name: string, query: Record<string, string>) {
  return request("/v1/saved-screens", savedScreenSchema, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name, query }),
  });
}

export function deleteSavedScreen(id: string) {
  return requestWithoutBody(`/v1/saved-screens/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getResearchNotes() {
  return request("/v1/notes", researchNotesResponseSchema).then(
    (result) => result.data,
  );
}

export function saveResearchNote(coinId: string, body: string) {
  return request(
    `/v1/notes/${encodeURIComponent(coinId)}`,
    researchNoteSchema,
    {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({ body }),
    },
  );
}

export function deleteResearchNote(coinId: string) {
  return requestWithoutBody(`/v1/notes/${encodeURIComponent(coinId)}`, {
    method: "DELETE",
  });
}
