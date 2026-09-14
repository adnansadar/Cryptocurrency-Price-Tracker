import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

const CoinDataContext = React.createContext();
const REFRESH_INTERVAL = 60_000;

export function useCoinData() {
  return useContext(CoinDataContext);
}

export function CoinDataProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [currency, setCurrencyState] = useState("usd");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const requestRef = useRef(null);
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = coins.length > 0;
  }, [coins]);

  const fetchCoins = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    if (hasDataRef.current) setRefreshing(true);
    else setLoading(true);
    setError("");

    const query = new URLSearchParams({
      vs_currency: currency,
      order: "market_cap_desc",
      per_page: "20",
      page: "1",
      sparkline: "false",
    });

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${query}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error(`Market data request failed with ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected market data format");

      setCoins(data);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError("Market data is temporarily unavailable. Please try again.");
      }
    } finally {
      if (requestRef.current === controller) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [currency]);

  useEffect(() => {
    fetchCoins();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchCoins();
    };
    const interval = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      requestRef.current?.abort();
    };
  }, [fetchCoins]);

  function setCurrency(nextCurrency) {
    if (nextCurrency === currency) return;
    requestRef.current?.abort();
    hasDataRef.current = false;
    setCoins([]);
    setError("");
    setLastUpdated(null);
    setLoading(true);
    setRefreshing(false);
    setCurrencyState(nextCurrency);
  }

  return (
    <CoinDataContext.Provider
      value={{
        coins,
        currency,
        setCurrency,
        loading,
        refreshing,
        error,
        lastUpdated,
        retry: fetchCoins,
      }}
    >
      {children}
    </CoinDataContext.Provider>
  );
}
