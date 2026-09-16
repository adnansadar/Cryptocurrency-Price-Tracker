"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { ChartRange, Currency } from "@crypto-terminal/contracts";
import { getHistory, getOhlc } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

type Props = { coinId: string; currency: Currency };

export function ResearchChart({ coinId, currency }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [range, setRange] = useState<ChartRange>("30");
  const [mode, setMode] = useState<"line" | "ohlc">("line");
  const history = useQuery({
    queryKey: ["history", coinId, currency, range],
    queryFn: () => getHistory(coinId, currency, range),
    enabled: mode === "line",
  });
  const ohlc = useQuery({
    queryKey: ["ohlc", coinId, currency, range],
    queryFn: () => getOhlc(coinId, currency, range),
    enabled: mode === "ohlc",
  });
  const data = mode === "line" ? history.data : ohlc.data;
  const isLoading = mode === "line" ? history.isLoading : ohlc.isLoading;
  const isError = mode === "line" ? history.isError : ohlc.isError;

  useEffect(() => {
    if (!container.current || !data?.length) return;
    chartRef.current?.remove();
    const styles = getComputedStyle(document.documentElement);
    const chart = createChart(container.current, {
      height: 390,
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
      timeScale: {
        borderColor: styles.getPropertyValue("--border").trim(),
        timeVisible: range === "7",
      },
      crosshair: {
        vertLine: {
          color: styles.getPropertyValue("--accent").trim(),
          width: 1,
        },
        horzLine: {
          color: styles.getPropertyValue("--accent").trim(),
          width: 1,
        },
      },
    });
    if (mode === "line") {
      const series: ISeriesApi<"Area"> = chart.addSeries(AreaSeries, {
        lineColor: styles.getPropertyValue("--accent").trim(),
        topColor: "rgba(245,196,81,.26)",
        bottomColor: "rgba(245,196,81,0)",
        lineWidth: 2,
      });
      series.setData(
        history.data!.map((point) => ({
          time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
          value: point.price,
        })),
      );
    } else {
      const series: ISeriesApi<"Candlestick"> = chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#63d993",
          downColor: "#ff7474",
          borderVisible: false,
          wickUpColor: "#63d993",
          wickDownColor: "#ff7474",
        },
      );
      series.setData(
        ohlc.data!.map((point) => ({
          time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
        })),
      );
    }
    chart.timeScale().fitContent();
    const observer = new ResizeObserver(([entry]) => {
      if (entry) chart.applyOptions({ width: entry.contentRect.width });
    });
    observer.observe(container.current);
    chartRef.current = chart;
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, history.data, mode, ohlc.data, range]);

  const recentHistory = history.data?.slice(-5).reverse() ?? [];
  const recentOhlc = ohlc.data?.slice(-5).reverse() ?? [];
  return (
    <section className="chart-panel" aria-labelledby="price-history-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Historical performance</p>
          <h2 id="price-history-title">Price history</h2>
        </div>
        <div className="chart-controls">
          <div className="segmented-control" aria-label="Chart type">
            <button
              type="button"
              className={mode === "line" ? "active" : ""}
              aria-pressed={mode === "line"}
              onClick={() => setMode("line")}
            >
              Line
            </button>
            <button
              type="button"
              className={mode === "ohlc" ? "active" : ""}
              aria-pressed={mode === "ohlc"}
              onClick={() => setMode("ohlc")}
            >
              Candles
            </button>
          </div>
          <div className="range-control" aria-label="Chart range">
            {(["7", "30", "90", "365"] as ChartRange[]).map((value) => (
              <button
                type="button"
                key={value}
                className={range === value ? "active" : ""}
                aria-pressed={range === value}
                onClick={() => setRange(value)}
              >
                {value === "365" ? "1Y" : `${value}D`}
              </button>
            ))}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="chart-loading">
          <span />
        </div>
      ) : isError ? (
        <div className="state-card compact">
          <h2>Chart unavailable</h2>
          <p>Try a different time range or refresh the page.</p>
        </div>
      ) : (
        <div ref={container} className="chart-container" aria-hidden="true" />
      )}
      <details className="accessible-data">
        <summary>
          View recent {mode === "line" ? "prices" : "candles"} as a table
        </summary>
        {mode === "line" ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Price</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((point) => (
                <tr key={point.timestamp}>
                  <td>{new Date(point.timestamp).toLocaleDateString()}</td>
                  <td>{formatCurrency(point.price, currency)}</td>
                  <td>{formatCurrency(point.volume, currency, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
              </tr>
            </thead>
            <tbody>
              {recentOhlc.map((point) => (
                <tr key={point.timestamp}>
                  <td>{new Date(point.timestamp).toLocaleDateString()}</td>
                  <td>{formatCurrency(point.open, currency)}</td>
                  <td>{formatCurrency(point.high, currency)}</td>
                  <td>{formatCurrency(point.low, currency)}</td>
                  <td>{formatCurrency(point.close, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>
    </section>
  );
}
