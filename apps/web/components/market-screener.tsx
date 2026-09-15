"use client";

import Image from "next/image";
import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Currency,
  MarketCoin,
  MarketQuery,
  MarketResponse,
  MarketSortKey,
} from "@crypto-terminal/contracts";
import { currencies } from "@crypto-terminal/contracts";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  addPrimaryWatchlistItem,
  createSavedScreen,
  getMarkets,
  getPrimaryWatchlist,
  marketSearchParams,
  removePrimaryWatchlistItem,
} from "@/lib/api";
import { AuthGateDialog } from "./auth-gate-dialog";
import { useAuth } from "./auth-provider";

type Category = { category_id: string; name: string };
type Props = {
  initialData: MarketResponse | null;
  categories: Category[];
  initialQuery: Partial<MarketQuery>;
};

function Change({ value }: { value: number | null }) {
  const state =
    value === null ? "neutral" : value >= 0 ? "positive" : "negative";
  return (
    <span className={`change ${state}`}>
      {value !== null && (
        <span aria-hidden="true">{value >= 0 ? "↗" : "↘"} </span>
      )}
      {formatPercent(value)}
    </span>
  );
}

export function MarketScreener({
  initialData,
  categories,
  initialQuery,
}: Props) {
  const { user, isPending: authPending } = useAuth();
  const queryClient = useQueryClient();
  const resolvedQuery = useMemo(
    () =>
      ({
        currency: "usd",
        page: 1,
        perPage: 25,
        search: "",
        category: "",
        ids: "",
        sort: "market_cap",
        direction: "desc",
        ...initialQuery,
      }) as MarketQuery,
    [initialQuery],
  );
  const [query, setQuery] = useState<MarketQuery>(resolvedQuery);
  const queryRef = useRef(query);
  const [gate, setGate] = useState<"watchlist" | "saved screens" | null>(null);
  const [showWatchlist, setShowWatchlist] = useState(Boolean(query.ids));
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    change7d: false,
    change30d: false,
    athDistance: false,
  });
  const [searchValue, setSearchValue] = useState(query.search);
  const toolbarRef = useRef<HTMLFormElement>(null);

  const result = useQuery({
    queryKey: ["markets", query],
    queryFn: () => getMarkets(query),
    initialData:
      query === resolvedQuery ? (initialData ?? undefined) : undefined,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

  const navigate = useCallback((next: Partial<MarketQuery>) => {
    const merged = { ...queryRef.current, ...next };
    queryRef.current = merged;
    setQuery(merged);
    window.history.replaceState(null, "", `/?${marketSearchParams(merged)}`);
  }, []);

  const watchlistResult = useQuery({
    queryKey: ["workspace", "primary-watchlist", user?.id],
    queryFn: getPrimaryWatchlist,
    enabled: Boolean(user),
  });
  const watchlist = useMemo(
    () => watchlistResult.data ?? [],
    [watchlistResult.data],
  );
  const watchlistMutation = useMutation({
    mutationFn: async (coinId: string) => {
      if (watchlist.includes(coinId)) await removePrimaryWatchlistItem(coinId);
      else await addPrimaryWatchlistItem(coinId);
      return coinId;
    },
    onMutate: async (coinId) => {
      const key = ["workspace", "primary-watchlist", user?.id] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key) ?? [];
      const next = previous.includes(coinId)
        ? previous.filter((id) => id !== coinId)
        : [...previous, coinId];
      queryClient.setQueryData(key, next);
      if (showWatchlist) navigate({ ids: next.join(","), page: 1 });
      return { key, previous };
    },
    onError: (_error, _coinId, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["workspace", "primary-watchlist", user?.id],
      }),
  });
  const saveScreenMutation = useMutation({
    mutationFn: ({
      name,
      value,
    }: {
      name: string;
      value: Record<string, string>;
    }) => createSavedScreen(name, value),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["workspace", "screens", user?.id],
      }),
  });

  useEffect(() => {
    queryRef.current = resolvedQuery;
    setQuery(resolvedQuery);
  }, [resolvedQuery]);

  useEffect(() => setSearchValue(query.search), [query.search]);

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      toolbarRef.current
        ?.querySelectorAll<HTMLDetailsElement>("details[open]")
        .forEach((menu) => {
          if (!menu.contains(target)) menu.removeAttribute("open");
        });
    }
    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, []);

  function sortBy(id: MarketSortKey) {
    navigate({
      sort: id,
      direction:
        query.sort === id && query.direction === "desc" ? "asc" : "desc",
      page: 1,
    });
  }

  function updateSearch(value: string) {
    setSearchValue(value);
    navigate({ search: value, page: 1 });
  }

  function handleWatchlistMode(active: boolean) {
    if (active && !user) {
      setGate("watchlist");
      return;
    }
    setShowWatchlist(active);
    navigate({ ids: active ? watchlist.join(",") : "", page: 1 });
  }

  const columns = useMemo<ColumnDef<MarketCoin>[]>(
    () => [
      {
        id: "coin",
        header: "Asset",
        cell: ({ row }) => (
          <Link
            className="coin-cell"
            href={`/coin/${row.original.id}?currency=${query.currency}`}
          >
            <Image src={row.original.image} alt="" width={36} height={36} />
            <span>
              <strong>{row.original.name}</strong>
              <small>
                #{row.original.marketCapRank ?? "—"} ·{" "}
                {row.original.symbol.toUpperCase()}
              </small>
            </span>
          </Link>
        ),
      },
      {
        id: "current_price",
        header: "Price",
        cell: ({ row }) =>
          formatCurrency(row.original.currentPrice, query.currency),
      },
      {
        id: "price_change_percentage_24h",
        header: "24h",
        cell: ({ row }) => <Change value={row.original.change24h} />,
      },
      {
        id: "change7d",
        header: "7d",
        cell: ({ row }) => <Change value={row.original.change7d} />,
      },
      {
        id: "change30d",
        header: "30d",
        cell: ({ row }) => <Change value={row.original.change30d} />,
      },
      {
        id: "total_volume",
        header: "Volume",
        cell: ({ row }) =>
          formatCurrency(row.original.totalVolume, query.currency, true),
      },
      {
        id: "market_cap",
        header: "Market cap",
        cell: ({ row }) =>
          formatCurrency(row.original.marketCap, query.currency, true),
      },
      {
        id: "athDistance",
        header: "From ATH",
        cell: ({ row }) =>
          row.original.athDistance === null
            ? "—"
            : `−${row.original.athDistance.toFixed(1)}%`,
      },
      {
        id: "watch",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            className={`watch-button ${!user ? "locked" : watchlist.includes(row.original.id) ? "active" : ""}`}
            aria-label={
              user
                ? `${watchlist.includes(row.original.id) ? "Remove" : "Add"} ${row.original.name} ${watchlist.includes(row.original.id) ? "from" : "to"} watchlist`
                : `Sign up to add ${row.original.name} to a watchlist`
            }
            disabled={authPending || watchlistMutation.isPending}
            onClick={() => {
              if (!user) setGate("watchlist");
              else watchlistMutation.mutate(row.original.id);
            }}
          >
            ★
          </button>
        ),
      },
    ],
    [authPending, query.currency, user, watchlist, watchlistMutation],
  );

  const table = useReactTable({
    data: result.data?.data ?? [],
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });
  const overview = result.data?.overview;
  const pagination = result.data?.pagination;

  function saveCurrentScreen() {
    if (!user) {
      setGate("saved screens");
      return;
    }
    const name = window.prompt("Name this screen", "My market screen")?.trim();
    if (!name) return;
    saveScreenMutation.mutate({
      name,
      value: Object.fromEntries(marketSearchParams(query)),
    });
  }

  return (
    <>
      {overview && (
        <section className="market-pulse" aria-label="Top 250 market overview">
          <article>
            <span>Top 250 market cap</span>
            <strong>
              {formatCurrency(overview.totalMarketCap, query.currency, true)}
            </strong>
          </article>
          <article>
            <span>24h volume</span>
            <strong>
              {formatCurrency(overview.totalVolume, query.currency, true)}
            </strong>
          </article>
          <article>
            <span>BTC dominance</span>
            <strong>{overview.bitcoinDominance.toFixed(1)}%</strong>
          </article>
          <article>
            <span>Market breadth</span>
            <strong>
              <i className="positive-text">{overview.advancing} up</i> /{" "}
              <i className="negative-text">{overview.declining} down</i>
            </strong>
          </article>
        </section>
      )}

      <section
        className="terminal-panel"
        aria-label="Cryptocurrency market screener"
      >
        <form
          ref={toolbarRef}
          className="screener-toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ search: searchValue, page: 1 });
          }}
        >
          <label className="search-control">
            <span className="sr-only">Search assets</span>
            <span aria-hidden="true">⌕</span>
            <input
              name="search"
              value={searchValue}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search assets or symbols"
            />
          </label>
          <select
            name="category"
            value={query.category}
            onChange={(event) =>
              navigate({ category: event.target.value, page: 1 })
            }
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="currency"
            value={query.currency}
            onChange={(event) =>
              navigate({
                currency: event.target.value as Currency,
                page: 1,
              })
            }
            aria-label="Currency"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency.toUpperCase()}
              </option>
            ))}
          </select>
          <div className="segmented-control">
            <button
              type="button"
              className={!showWatchlist ? "active" : ""}
              onClick={() => handleWatchlistMode(false)}
            >
              All
            </button>
            <button
              type="button"
              className={showWatchlist ? "active" : ""}
              onClick={() => handleWatchlistMode(true)}
            >
              Watchlist
            </button>
          </div>
          <details className="filter-menu">
            <summary>Filters</summary>
            <div className="filter-popover">
              {[
                { key: "minMarketCap", label: "Min market cap" },
                { key: "minVolume", label: "Min 24h volume" },
                { key: "minChange", label: "Min 24h change %" },
                { key: "maxChange", label: "Max 24h change %" },
                { key: "maxAthDistance", label: "Max distance from ATH %" },
              ].map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    type="number"
                    defaultValue={String(
                      query[field.key as keyof MarketQuery] ?? "",
                    )}
                    onChange={(event) =>
                      navigate({
                        [field.key]: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                        page: 1,
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </details>
          <details className="filter-menu">
            <summary>Columns</summary>
            <div className="filter-popover column-options">
              {table
                .getAllLeafColumns()
                .filter((column) => !["coin", "watch"].includes(column.id))
                .map((column) => (
                  <label key={column.id}>
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />{" "}
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </label>
                ))}
            </div>
          </details>
          <button
            type="button"
            className="secondary-button"
            onClick={saveCurrentScreen}
            disabled={authPending || saveScreenMutation.isPending}
          >
            {user ? "Save screen" : "🔒 Save screen"}
          </button>
        </form>

        {result.isError ? (
          <div className="state-card">
            <span>!</span>
            <h2>Market data is unavailable</h2>
            <p>{result.error.message}</p>
            <button className="primary-button" onClick={() => result.refetch()}>
              Try again
            </button>
          </div>
        ) : (
          <div
            className={`table-scroll ${result.isFetching ? "refreshing" : ""}`}
          >
            <table className="market-table">
              <caption className="sr-only">
                Top cryptocurrency market data
              </caption>
              <thead>
                <tr>
                  {table.getVisibleLeafColumns().map((column) => {
                    const sortable = [
                      "current_price",
                      "price_change_percentage_24h",
                      "total_volume",
                      "market_cap",
                    ].includes(column.id);
                    return (
                      <th
                        key={column.id}
                        className={column.id === "coin" ? "" : "numeric"}
                        aria-sort={
                          query.sort === column.id
                            ? query.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        {sortable ? (
                          <button
                            className="sort-button"
                            onClick={() => sortBy(column.id as MarketSortKey)}
                          >
                            {String(column.columnDef.header ?? "")}
                            <span>
                              {query.sort === column.id
                                ? query.direction === "asc"
                                  ? "↑"
                                  : "↓"
                                : "↕"}
                            </span>
                          </button>
                        ) : (
                          String(column.columnDef.header ?? "")
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {result.isLoading
                  ? Array.from({ length: 10 }, (_, index) => (
                      <tr key={index} className="skeleton-row">
                        <td colSpan={9}>
                          <span />
                        </td>
                      </tr>
                    ))
                  : table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={
                              cell.column.id === "coin" ? "" : "numeric"
                            }
                            data-label={
                              typeof cell.column.columnDef.header === "string"
                                ? cell.column.columnDef.header
                                : ""
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
            {!result.isLoading && !table.getRowModel().rows.length && (
              <div className="state-card">
                <span>⌕</span>
                <h2>No assets match this screen</h2>
                <p>Remove a filter or broaden your search.</p>
              </div>
            )}
          </div>
        )}
        {pagination && (
          <div className="pagination">
            <span>
              Showing{" "}
              {pagination.total
                ? (pagination.page - 1) * pagination.perPage + 1
                : 0}
              –
              {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
              of {pagination.total}
            </span>
            <div>
              <button
                disabled={pagination.page <= 1}
                onClick={() => navigate({ page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => navigate({ page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
      <AuthGateDialog
        open={gate !== null}
        onClose={() => setGate(null)}
        feature={gate ?? "saved research"}
      />
    </>
  );
}
