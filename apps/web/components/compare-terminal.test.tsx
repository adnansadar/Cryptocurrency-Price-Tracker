import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ComparisonAsset } from "@crypto-terminal/contracts";
import { ComparisonChart } from "./compare-terminal";

vi.mock("lightweight-charts", () => ({
  ColorType: { Solid: "solid" },
  LineSeries: {},
  createChart: () => ({
    addSeries: () => ({ setData: vi.fn() }),
    applyOptions: vi.fn(),
    remove: vi.fn(),
    timeScale: () => ({ fitContent: vi.fn() }),
  }),
}));

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("ComparisonChart accessibility", () => {
  it("provides an accessible chart name and latest-value table", () => {
    const assets: ComparisonAsset[] = [
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "btc",
        image: "https://assets.coingecko.com/bitcoin.png",
        points: [
          {
            timestamp: 1_700_000_000_000,
            price: 40_000,
            marketCap: 800_000_000_000,
            volume: 20_000_000_000,
            normalizedReturn: 12.5,
          },
        ],
        metrics: {
          totalReturn: 12.5,
          annualizedVolatility: 30,
          maxDrawdown: -10,
          averageVolume: 20_000_000_000,
          correlationToFirst: null,
        },
      },
    ];

    render(
      <ComparisonChart
        assets={assets}
        metric="normalizedReturn"
        currency="usd"
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Normalized return comparison chart",
      }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByText("View latest comparison values as a table"),
    );
    expect(
      screen.getByRole("columnheader", { name: "Normalized return" }),
    ).toBeVisible();
    expect(screen.getByRole("cell", { name: "+12.50%" })).toBeInTheDocument();
  });
});
