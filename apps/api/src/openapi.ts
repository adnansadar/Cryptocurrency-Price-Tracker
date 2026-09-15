export function createOpenApiDocument(origin: string) {
  const error = {
    type: "object",
    properties: {
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          requestId: { type: "string" },
        },
        required: ["code", "message"],
      },
    },
    required: ["error"],
  };
  const responses = {
    "400": {
      description: "Invalid request",
      content: { "application/json": { schema: error } },
    },
    "429": {
      description: "Client rate limit exceeded",
      content: { "application/json": { schema: error } },
    },
    "503": {
      description: "Provider or optional persistence unavailable",
      content: { "application/json": { schema: error } },
    },
  };
  return {
    openapi: "3.1.0",
    info: {
      title: "Crypto Research Terminal API",
      version: "1.0.0",
      description:
        "Versioned market research and workspace API. All market data is sourced from CoinGecko.",
    },
    servers: [{ url: origin }],
    tags: [{ name: "Market" }, { name: "Research" }, { name: "Workspace" }],
    paths: {
      "/health": {
        get: {
          summary: "Service health",
          responses: { "200": { description: "Service status" } },
        },
      },
      "/v1/auth/capabilities": {
        get: {
          summary: "List configured authentication methods",
          responses: { "200": { description: "Authentication capabilities" } },
        },
      },
      "/v1/markets": {
        get: {
          tags: ["Market"],
          summary: "Filter and paginate the top 250 market snapshot",
          parameters: [
            {
              name: "currency",
              in: "query",
              schema: {
                type: "string",
                enum: ["usd", "inr", "eur", "gbp", "cad", "jpy", "aud", "chf"],
                default: "usd",
              },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "perPage",
              in: "query",
              schema: {
                type: "integer",
                minimum: 10,
                maximum: 100,
                default: 25,
              },
            },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "market_cap",
                  "current_price",
                  "price_change_percentage_24h",
                  "total_volume",
                  "ath_distance",
                ],
              },
            },
          ],
          responses: {
            "200": {
              description: "Market page with overview and cache metadata",
            },
            ...responses,
          },
        },
      },
      "/v1/categories": {
        get: {
          tags: ["Market"],
          summary: "List supported asset categories",
          responses: { "200": { description: "Category list" }, ...responses },
        },
      },
      "/v1/coins/list": {
        get: {
          tags: ["Market"],
          summary: "List market-ranked cryptocurrencies for autocomplete",
          responses: { "200": { description: "Coin ID list" }, ...responses },
        },
      },
      "/v1/coins/{coinId}": {
        get: {
          tags: ["Research"],
          summary: "Asset metadata and market profile",
          parameters: [
            {
              name: "coinId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Asset profile" }, ...responses },
        },
      },
      "/v1/coins/{coinId}/history": {
        get: {
          tags: ["Research"],
          summary: "Historical price, market cap, and volume",
          parameters: [
            {
              name: "coinId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "range",
              in: "query",
              schema: { type: "string", enum: ["7", "30", "90", "365"] },
            },
          ],
          responses: {
            "200": { description: "Historical observations" },
            ...responses,
          },
        },
      },
      "/v1/coins/{coinId}/ohlc": {
        get: {
          tags: ["Research"],
          summary: "Historical candlestick observations",
          parameters: [
            {
              name: "coinId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "OHLC observations" },
            ...responses,
          },
        },
      },
      "/v1/compare": {
        get: {
          tags: ["Research"],
          summary: "Compare return and risk for two to four assets",
          parameters: [
            {
              name: "ids",
              in: "query",
              required: true,
              schema: { type: "string", example: "bitcoin,ethereum" },
            },
          ],
          responses: {
            "200": { description: "Normalized series and analytics" },
            ...responses,
          },
        },
      },
      "/v1/watchlists": {
        get: {
          tags: ["Workspace"],
          summary: "List the authenticated user's watchlists",
          responses: { "200": { description: "Watchlists" }, ...responses },
        },
        post: {
          tags: ["Workspace"],
          summary: "Create a watchlist",
          responses: {
            "201": { description: "Created watchlist" },
            ...responses,
          },
        },
      },
      "/v1/watchlist": {
        get: {
          tags: ["Workspace"],
          summary: "List primary watchlist coin IDs",
          responses: {
            "200": { description: "Primary watchlist" },
            ...responses,
          },
        },
      },
      "/v1/watchlist/{coinId}": {
        put: {
          tags: ["Workspace"],
          summary: "Add an asset to the primary watchlist",
          responses: { "201": { description: "Watchlist item" }, ...responses },
        },
        delete: {
          tags: ["Workspace"],
          summary: "Remove an asset from the primary watchlist",
          responses: { "204": { description: "Asset removed" }, ...responses },
        },
      },
      "/v1/saved-screens": {
        get: {
          tags: ["Workspace"],
          summary: "List saved screens",
          responses: { "200": { description: "Saved screens" }, ...responses },
        },
        post: {
          tags: ["Workspace"],
          summary: "Create a saved screen",
          responses: { "201": { description: "Created screen" }, ...responses },
        },
      },
      "/v1/notes": {
        get: {
          tags: ["Workspace"],
          summary: "List research notes",
          responses: { "200": { description: "Research notes" }, ...responses },
        },
      },
    },
  };
}
