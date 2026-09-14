import React, { useEffect, useMemo, useState } from "react";
import Coin from "./Coin";
import Footer from "./Footer";
import Nav from "./Nav";
import { useCoinData } from "../context/CoinDataProvider";

const WATCHLIST_STORAGE_KEY = "cryptoTracker.watchlist";
const CURRENCIES = ["usd", "inr", "eur", "gbp", "cad", "jpy", "aud", "chf"];
const SORT_OPTIONS = {
  current_price: "Price",
  price_change_percentage_24h: "24h change",
  total_volume: "Volume",
  market_cap: "Market cap",
};

function getInitialWatchlist() {
  try {
    const storedValue = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || "[]");
    return Array.isArray(storedValue)
      ? storedValue.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function SortButton({ field, label, sort, onSort }) {
  const active = sort.key === field;
  const directionLabel = active && sort.direction === "asc" ? "ascending" : "descending";

  return (
    <button
      className={`sort-button ${active ? "active" : ""}`}
      type="button"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}${active ? `, currently ${directionLabel}` : ""}`}
    >
      {label}
      <span aria-hidden="true">{active ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );
}

function LoadingRows() {
  return Array.from({ length: 6 }, (_, index) => (
    <tr className="skeleton-row" key={index} aria-hidden="true">
      <td><span className="skeleton coin-skeleton" /></td>
      <td><span className="skeleton value-skeleton" /></td>
      <td><span className="skeleton value-skeleton" /></td>
      <td><span className="skeleton value-skeleton" /></td>
      <td><span className="skeleton value-skeleton" /></td>
      <td><span className="skeleton star-skeleton" /></td>
    </tr>
  ));
}

export function Home() {
  const {
    coins,
    currency,
    setCurrency,
    loading,
    refreshing,
    error,
    lastUpdated,
    retry,
  } = useCoinData();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState({ key: "market_cap", direction: "desc" });
  const [watchlist, setWatchlist] = useState(getInitialWatchlist);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch {
      // Watchlist remains usable for the current session if storage is unavailable.
    }
  }, [watchlist]);

  const displayedCoins = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return coins
      .filter((coin) => {
        const matchesSearch =
          !normalizedSearch ||
          coin.name.toLowerCase().includes(normalizedSearch) ||
          coin.symbol.toLowerCase().includes(normalizedSearch);
        const matchesList = activeFilter === "all" || watchlist.includes(coin.id);
        return matchesSearch && matchesList;
      })
      .sort((first, second) => {
        const firstValue = Number.isFinite(first[sort.key]) ? first[sort.key] : null;
        const secondValue = Number.isFinite(second[sort.key]) ? second[sort.key] : null;
        if (firstValue === null && secondValue === null) return 0;
        if (firstValue === null) return 1;
        if (secondValue === null) return -1;
        return sort.direction === "asc"
          ? firstValue - secondValue
          : secondValue - firstValue;
      });
  }, [activeFilter, coins, search, sort, watchlist]);

  function handleSort(key) {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === "desc" ? "asc" : "desc",
    }));
  }

  function toggleWatchlist(coinId) {
    setWatchlist((currentWatchlist) =>
      currentWatchlist.includes(coinId)
        ? currentWatchlist.filter((id) => id !== coinId)
        : [...currentWatchlist, coinId],
    );
  }

  const emptyTitle = activeFilter === "watchlist" && watchlist.length === 0
    ? "Your watchlist is empty"
    : "No coins found";
  const emptyMessage = activeFilter === "watchlist" && watchlist.length === 0
    ? "Star a coin from the market list to keep it close."
    : "Try a different name or symbol.";

  return (
    <div className="app-shell">
      <Nav />
      <main className="shell main-content">
        <section className="market-heading" aria-labelledby="market-title">
          <div>
            <p className="eyebrow">Top 20 by market cap</p>
            <h1 id="market-title">Crypto markets</h1>
          </div>
          <div className="update-status" aria-live="polite">
            <span className={refreshing ? "refresh-dot active" : "refresh-dot"} aria-hidden="true" />
            {refreshing
              ? "Refreshing prices…"
              : lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Connecting to market data"}
          </div>
        </section>

        <section className="market-panel" aria-label="Cryptocurrency market">
          <div className="toolbar">
            <label className="search-field">
              <span className="sr-only">Search coins</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                type="search"
                placeholder="Search name or symbol"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button type="button" className="clear-search" onClick={() => setSearch("")} aria-label="Clear search">×</button>
              )}
            </label>

            <div className="segmented-control" aria-label="Coin list filter">
              <button type="button" className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")} aria-pressed={activeFilter === "all"}>All</button>
              <button type="button" className={activeFilter === "watchlist" ? "active" : ""} onClick={() => setActiveFilter("watchlist")} aria-pressed={activeFilter === "watchlist"}>Watchlist</button>
            </div>

            <label className="currency-control">
              <span>Currency</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {CURRENCIES.map((currencyCode) => (
                  <option value={currencyCode} key={currencyCode}>{currencyCode.toUpperCase()}</option>
                ))}
              </select>
            </label>

            <button className="refresh-button" type="button" onClick={retry} disabled={refreshing}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 9m2 6a7 7 0 0 0 12 2.5L20 15" /></svg>
              Refresh
            </button>
          </div>

          {error && coins.length > 0 && (
            <div className="inline-alert" role="status">
              <span>{error} Showing the most recent prices.</span>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          )}

          {error && !loading && coins.length === 0 ? (
            <div className="state-card" role="alert">
              <span className="state-icon" aria-hidden="true">!</span>
              <h2>We couldn’t load the market</h2>
              <p>{error}</p>
              <button className="primary-button" type="button" onClick={retry}>Try again</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="market-table">
                <caption className="sr-only">Current cryptocurrency prices and market statistics</caption>
                <thead>
                  <tr>
                    <th scope="col">Coin</th>
                    {Object.entries(SORT_OPTIONS).map(([field, label]) => (
                      <th scope="col" className="numeric" key={field} aria-sort={sort.key === field ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
                        <SortButton field={field} label={label} sort={sort} onSort={handleSort} />
                      </th>
                    ))}
                    <th scope="col"><span className="sr-only">Watchlist</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && coins.length === 0 ? (
                    <LoadingRows />
                  ) : (
                    displayedCoins.map((coin) => (
                      <Coin
                        key={coin.id}
                        name={coin.name}
                        image={coin.image}
                        symbol={coin.symbol}
                        price={coin.current_price}
                        marketCap={coin.market_cap}
                        priceChange={coin.price_change_percentage_24h}
                        volume={coin.total_volume}
                        currency={currency}
                        watched={watchlist.includes(coin.id)}
                        onToggleWatch={() => toggleWatchlist(coin.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
              {!loading && coins.length > 0 && displayedCoins.length === 0 && (
                <div className="state-card compact">
                  <span className="state-icon star" aria-hidden="true">☆</span>
                  <h2>{emptyTitle}</h2>
                  <p>{emptyMessage}</p>
                  {activeFilter === "watchlist" && watchlist.length === 0 && (
                    <button className="secondary-button" type="button" onClick={() => setActiveFilter("all")}>Browse markets</button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
