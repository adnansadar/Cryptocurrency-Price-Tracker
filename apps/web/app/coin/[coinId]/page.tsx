import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currencySchema, type Currency } from "@crypto-terminal/contracts";
import { ResearchChart } from "@/components/research-chart";
import { ResearchNote } from "@/components/research-note";
import { getCoin } from "@/lib/api";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ coinId: string }>;
  searchParams: Promise<{ currency?: string }>;
}) {
  const { coinId } = await params;
  const currency = currencySchema
    .catch("usd")
    .parse((await searchParams).currency) as Currency;
  const coin = await getCoin(coinId, currency).catch(() => null);
  if (!coin) notFound();
  const stats = [
    ["Market cap", formatCurrency(coin.marketCap, currency, true)],
    ["24h volume", formatCurrency(coin.totalVolume, currency, true)],
    ["Circulating supply", formatNumber(coin.circulatingSupply)],
    ["Maximum supply", formatNumber(coin.maxSupply)],
    ["All-time high", formatCurrency(coin.ath, currency)],
    ["All-time low", formatCurrency(coin.atl, currency)],
  ];
  return (
    <main className="shell main-content">
      <Link href="/" className="back-link">
        ← Back to markets
      </Link>
      <section className="asset-hero">
        <div className="asset-title">
          <Image src={coin.image} alt="" width={64} height={64} priority />
          <div>
            <span>
              #{coin.marketCapRank ?? "—"} · {coin.symbol.toUpperCase()}
            </span>
            <h1>{coin.name}</h1>
          </div>
        </div>
        <div className="asset-price">
          <span>Current price</span>
          <strong>{formatCurrency(coin.currentPrice, currency)}</strong>
          <span
            className={
              (coin.change24h ?? 0) >= 0 ? "positive-text" : "negative-text"
            }
          >
            {formatPercent(coin.change24h)} today
          </span>
        </div>
      </section>
      <ResearchChart coinId={coin.id} currency={currency} />
      <div className="research-grid">
        <section className="stats-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Market profile</p>
              <h2>Key statistics</h2>
            </div>
            <span>Updated {new Date(coin.lastUpdated).toLocaleString()}</span>
          </div>
          <dl>
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <ResearchNote coinId={coin.id} coinName={coin.name} />
      </div>
      <section className="about-panel">
        <p className="eyebrow">Asset brief</p>
        <h2>About {coin.name}</h2>
        <p>
          {coin.description ||
            "No project description is currently available from the data provider."}
        </p>
        <div className="tag-list">
          {coin.categories.slice(0, 6).map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
        {coin.homepage && (
          <a href={coin.homepage} target="_blank" rel="noreferrer">
            Official website ↗
          </a>
        )}
      </section>
    </main>
  );
}
