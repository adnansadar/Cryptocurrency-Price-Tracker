"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChartRange,
  CoinListItem,
  ComparisonAsset,
  Currency,
} from "@crypto-terminal/contracts";
import { currencies } from "@crypto-terminal/contracts";
import { getCoinList, getComparison } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/format";

const colors = ["#f5c451", "#63d993", "#7ca7ff", "#f58bd7"];
const comparisonMetrics = {
  normalizedReturn: "Normalized return",
  price: "Price",
  marketCap: "Market cap",
  volume: "Volume",
} as const;
type ComparisonMetric = keyof typeof comparisonMetrics;

function CryptocurrencySelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const coinList = useQuery({
    queryKey: ["market-coin-list"],
    queryFn: getCoinList,
    staleTime: 86_400_000,
  });
  const coinsById = useMemo(
    () => new Map((coinList.data?.data ?? []).map((coin) => [coin.id, coin])),
    [coinList.data?.data],
  );
  const suggestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const selected = new Set(selectedIds);
    return (coinList.data?.data ?? [])
      .filter((coin) => {
        const searchable =
          `${coin.id} ${coin.name} ${coin.symbol}`.toLowerCase();
        return !selected.has(coin.id) && (!term || searchable.includes(term));
      })
      .sort((a, b) => {
        const rank = (coin: CoinListItem) => {
          if (!term) return 0;
          if (coin.name.toLowerCase().startsWith(term)) return 0;
          if (coin.symbol.toLowerCase().startsWith(term)) return 1;
          if (coin.id.toLowerCase().startsWith(term)) return 2;
          return 3;
        };
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      })
      .slice(0, 50);
  }, [coinList.data?.data, search, selectedIds]);

  function selectCoin(coin: CoinListItem) {
    if (selectedIds.length >= 4) return;
    onChange([...selectedIds, coin.id]);
    setSearch("");
    setOpen(selectedIds.length + 1 < 4);
    setHighlighted(0);
  }

  return (
    <div className="coin-autocomplete">
      <div className="selected-coins" aria-label="Selected cryptocurrencies">
        {selectedIds.map((id) => {
          const coin = coinsById.get(id);
          return (
            <span key={id}>
              {coin?.name ?? id}
              <button
                type="button"
                aria-label={`Remove ${coin?.name ?? id}`}
                onClick={() =>
                  onChange(
                    selectedIds.filter((selectedId) => selectedId !== id),
                  )
                }
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <input
        id="cryptocurrency-search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && !search && selectedIds.length > 0) {
            onChange(selectedIds.slice(0, -1));
            return;
          }
          if (!open || !suggestions.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((current) => (current + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted(
              (current) =>
                (current - 1 + suggestions.length) % suggestions.length,
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            const coin = suggestions[highlighted];
            if (coin) selectCoin(coin);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={
          selectedIds.length >= 4
            ? "Maximum of four selected"
            : "Search cryptocurrencies"
        }
        disabled={selectedIds.length >= 4}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && selectedIds.length < 4}
        aria-controls="cryptocurrency-suggestions"
        aria-activedescendant={
          open && suggestions[highlighted]
            ? `cryptocurrency-option-${suggestions[highlighted].id}`
            : undefined
        }
      />
      {open && selectedIds.length < 4 && coinList.isLoading && (
        <div className="coin-suggestions coin-suggestions-state">
          Loading cryptocurrencies…
        </div>
      )}
      {open && selectedIds.length < 4 && coinList.isError && (
        <div className="coin-suggestions coin-suggestions-state">
          <span>Could not load cryptocurrencies.</span>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void coinList.refetch()}
          >
            Try again
          </button>
        </div>
      )}
      {open &&
        selectedIds.length < 4 &&
        coinList.isSuccess &&
        suggestions.length === 0 && (
          <div className="coin-suggestions coin-suggestions-state">
            No cryptocurrencies match “{search}”.
          </div>
        )}
      {open && coinList.isSuccess && suggestions.length > 0 && (
        <ul
          id="cryptocurrency-suggestions"
          className="coin-suggestions"
          role="listbox"
        >
          {suggestions.map((coin, index) => (
            <li
              id={`cryptocurrency-option-${coin.id}`}
              key={coin.id}
              role="option"
              aria-selected={index === highlighted}
            >
              <button
                type="button"
                className={index === highlighted ? "active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCoin(coin)}
              >
                <strong>{coin.name}</strong>
                <span>
                  {coin.symbol.toUpperCase()} · {coin.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ComparisonChart({
  assets,
  metric,
  currency,
}: {
  assets: ComparisonAsset[];
  metric: ComparisonMetric;
  currency: Currency;
}) {
  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  useEffect(() => {
    if (!container.current || !assets.length) return;
    const styles = getComputedStyle(document.documentElement);
    const chart = createChart(container.current, {
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: styles.getPropertyValue("--text-muted").trim(),
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: styles.getPropertyValue("--chart-grid").trim() },
        horzLines: { color: styles.getPropertyValue("--chart-grid").trim() },
      },
      rightPriceScale: {
        borderColor: styles.getPropertyValue("--border").trim(),
      },
      timeScale: { borderColor: styles.getPropertyValue("--border").trim() },
    });
    assets.forEach((asset, index) => {
      const series = chart.addSeries(LineSeries, {
        color: colors[index],
        lineWidth: 2,
        title: asset.symbol.toUpperCase(),
        priceFormat: {
          type: "custom",
          formatter: (value: number) =>
            metric === "normalizedReturn"
              ? `${value.toFixed(1)}%`
              : formatCurrency(value, currency, metric !== "price"),
        },
      });
      series.setData(
        asset.points.flatMap((point) => {
          const value = point[metric];
          return value === null
            ? []
            : [
                {
                  time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
                  value,
                },
              ];
        }),
      );
    });
    chart.timeScale().fitContent();
    const observer = new ResizeObserver(
      ([entry]) =>
        entry && chart.applyOptions({ width: entry.contentRect.width }),
    );
    observer.observe(container.current);
    chartRef.current = chart;
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [assets, currency, metric]);
  const latest = assets.flatMap((asset) => {
    const point = asset.points.at(-1);
    return point ? [{ asset, point }] : [];
  });
  return (
    <>
      <div
        ref={container}
        className="chart-container"
        role="img"
        aria-label={`${comparisonMetrics[metric]} comparison chart`}
      />
      <details className="accessible-data">
        <summary>View latest comparison values as a table</summary>
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Date</th>
              <th>{comparisonMetrics[metric]}</th>
            </tr>
          </thead>
          <tbody>
            {latest.map(({ asset, point }) => {
              const value = point[metric];
              return (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{new Date(point.timestamp).toLocaleDateString()}</td>
                  <td>
                    {value === null
                      ? "—"
                      : metric === "normalizedReturn"
                        ? formatPercent(value)
                        : formatCurrency(value, currency, metric !== "price")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </>
  );
}

export function CompareTerminal() {
  const [draftIds, setDraftIds] = useState(["bitcoin", "ethereum", "solana"]);
  const [ids, setIds] = useState(["bitcoin", "ethereum", "solana"]);
  const [range, setRange] = useState<ChartRange>("90");
  const [currency, setCurrency] = useState<Currency>("usd");
  const [metric, setMetric] = useState<ComparisonMetric>("normalizedReturn");
  const result = useQuery({
    queryKey: ["compare", ids, range, currency],
    queryFn: () => getComparison(ids, currency, range),
    enabled: ids.length >= 2,
  });
  const assets = result.data?.assets ?? [];

  function compareCryptocurrencies(nextIds: string[]) {
    setDraftIds(nextIds);
    setIds(nextIds);
  }

  return (
    <>
      <section className="compare-toolbar terminal-panel">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setIds(draftIds);
          }}
        >
          <div className="compare-field">
            <label htmlFor="cryptocurrency-search">Cryptocurrencies</label>
            <CryptocurrencySelect
              selectedIds={draftIds}
              onChange={compareCryptocurrencies}
            />
          </div>
          <label>
            <span>Range</span>
            <select
              value={range}
              onChange={(event) => setRange(event.target.value as ChartRange)}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </label>
          <label>
            <span>Currency</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            >
              {currencies.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button">Compare</button>
        </form>
        <p>Search and select two to four cryptocurrencies to compare.</p>
      </section>
      <section className="chart-panel comparison-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comparison chart</p>
            <h2>{comparisonMetrics[metric]}</h2>
          </div>
          <div className="comparison-controls">
            <select
              className="metric-select"
              value={metric}
              onChange={(event) =>
                setMetric(event.target.value as ComparisonMetric)
              }
              aria-label="Chart metric"
            >
              {Object.entries(comparisonMetrics).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="chart-legend">
              {assets.map((asset, index) => (
                <span key={asset.id}>
                  <i style={{ background: colors[index] }} />
                  {asset.symbol.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
        {result.isLoading ? (
          <div className="chart-loading">
            <span />
          </div>
        ) : result.isError ? (
          <div className="state-card compact">
            <h2>Comparison unavailable</h2>
            <p>{result.error.message}</p>
          </div>
        ) : (
          <ComparisonChart
            assets={assets}
            metric={metric}
            currency={currency}
          />
        )}
      </section>
      {!!assets.length && (
        <section className="terminal-panel metrics-table">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Risk lens</p>
              <h2>Performance metrics</h2>
            </div>
            <span>Volatility is annualized from observed returns.</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Total return</th>
                  <th>Volatility</th>
                  <th>Max drawdown</th>
                  <th>Avg. volume</th>
                  <th>Correlation to {assets[0]?.symbol.toUpperCase()}</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <Image src={asset.image} alt="" width={28} height={28} />
                      <strong>{asset.name}</strong>
                    </td>
                    <td
                      className={
                        asset.metrics.totalReturn >= 0
                          ? "positive-text"
                          : "negative-text"
                      }
                    >
                      {formatPercent(asset.metrics.totalReturn)}
                    </td>
                    <td>{formatPercent(asset.metrics.annualizedVolatility)}</td>
                    <td className="negative-text">
                      {formatPercent(asset.metrics.maxDrawdown)}
                    </td>
                    <td>
                      {formatCurrency(
                        asset.metrics.averageVolume,
                        currency,
                        true,
                      )}
                    </td>
                    <td>
                      {asset.metrics.correlationToFirst === null
                        ? "Reference"
                        : asset.metrics.correlationToFirst.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
