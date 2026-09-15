import type { Currency } from "@crypto-terminal/contracts";

const locales: Record<Currency, string> = {
  usd: "en-US",
  inr: "en-IN",
  eur: "de-DE",
  gbp: "en-GB",
  cad: "en-CA",
  jpy: "ja-JP",
  aud: "en-AU",
  chf: "de-CH",
};

export function formatCurrency(
  value: number | null,
  currency: Currency,
  compact = false,
) {
  if (value === null || !Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  const digits = absolute < 1 ? 6 : absolute < 100 ? 3 : 2;
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 2 : undefined,
    maximumFractionDigits: compact ? 2 : digits,
  }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
