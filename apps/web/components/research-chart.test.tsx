import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ResearchChart } from "./research-chart";

vi.mock("lightweight-charts", () => ({
  AreaSeries: {},
  CandlestickSeries: {},
  ColorType: { Solid: "solid" },
  createChart: () => ({
    addSeries: () => ({ setData: vi.fn() }),
    applyOptions: vi.fn(),
    remove: vi.fn(),
    timeScale: () => ({ fitContent: vi.fn() }),
  }),
}));

vi.mock("@/lib/api", () => ({
  getHistory: async () => [
    { timestamp: 1_700_000_000_000, price: 100, marketCap: 1_000, volume: 50 },
  ],
  getOhlc: async () => [
    { timestamp: 1_700_000_000_000, open: 90, high: 110, low: 80, close: 100 },
  ],
}));

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("ResearchChart accessibility", () => {
  it("keeps the accessible data table in sync with the selected chart type", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ResearchChart coinId="bitcoin" currency="usd" />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Line" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() =>
      expect(screen.getByText("$100.00")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Candles" }));

    expect(screen.getByRole("button", { name: "Candles" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByText("View recent candles as a table"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("View recent candles as a table"));
    await waitFor(() =>
      expect(screen.getByRole("columnheader", { name: "Open" })).toBeVisible(),
    );
    await waitFor(() =>
      expect(screen.getByRole("cell", { name: "$90.00" })).toBeInTheDocument(),
    );
  });
});
