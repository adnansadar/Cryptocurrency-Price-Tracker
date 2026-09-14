import React from "react";

const LOCALES = {
  inr: "en-IN",
  usd: "en-US",
  eur: "de-DE",
  gbp: "en-GB",
  cad: "en-CA",
  jpy: "ja-JP",
  aud: "en-AU",
  chf: "de-CH",
};

export function formatCurrency(value, currency, compact = false) {
  if (!Number.isFinite(value)) return "—";
  const absoluteValue = Math.abs(value);
  const fractionDigits = absoluteValue < 1 ? 6 : absoluteValue < 100 ? 3 : 2;

  return new Intl.NumberFormat(LOCALES[currency] || "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : fractionDigits,
  }).format(value);
}

const Coin = ({
  name,
  image,
  symbol,
  price,
  volume,
  priceChange,
  marketCap,
  currency,
  watched,
  onToggleWatch,
}) => {
  const hasChange = Number.isFinite(priceChange);
  const isPositive = hasChange && priceChange >= 0;
  const changeLabel = hasChange
    ? `${isPositive ? "Up" : "Down"} ${Math.abs(priceChange).toFixed(2)} percent`
    : "Change unavailable";

  return (
    <tr className="coin-row">
      <td className="coin-identity">
        <div className="coin-identity-inner">
          <img className="coin-logo" src={image} alt="" width="36" height="36" />
          <span className="coin-name-wrap">
            <span className="coin-name">{name}</span>
            <span className="coin-symbol">{symbol.toUpperCase()}</span>
          </span>
        </div>
      </td>
      <td data-label="Price" className="numeric primary-value">{formatCurrency(price, currency)}</td>
      <td data-label="24h change" className="numeric">
        <span className={`change ${hasChange ? (isPositive ? "positive" : "negative") : "neutral"}`} aria-label={changeLabel}>
          {hasChange ? `${isPositive ? "↑ +" : "↓ "}${priceChange.toFixed(2)}%` : "—"}
        </span>
      </td>
      <td data-label="Volume" className="numeric secondary-value">{formatCurrency(volume, currency, true)}</td>
      <td data-label="Market cap" className="numeric secondary-value">{formatCurrency(marketCap, currency, true)}</td>
      <td className="watch-cell">
        <button
          type="button"
          className={`watch-button ${watched ? "is-watched" : ""}`}
          onClick={onToggleWatch}
          aria-pressed={watched}
          aria-label={`${watched ? "Remove" : "Add"} ${name} ${watched ? "from" : "to"} watchlist`}
          title={`${watched ? "Remove from" : "Add to"} watchlist`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default Coin;
