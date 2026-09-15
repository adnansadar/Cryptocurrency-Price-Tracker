import { Suspense } from "react";
import type { MarketQuery } from "@crypto-terminal/contracts";
import { MarketScreener } from "@/components/market-screener";
import { getCategories, getMarkets } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialQuery = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Partial<MarketQuery>;
  const [marketResult, categoryResult] = await Promise.allSettled([
    getMarkets(initialQuery),
    getCategories(),
  ]);
  return (
    <main className="shell main-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Market intelligence</p>
          <h1>Find signal in the market.</h1>
          <p>
            Screen the top 250 assets, investigate momentum, and save the views
            that matter.
          </p>
        </div>
      </section>
      <Suspense
        fallback={
          <div className="terminal-panel state-card">
            Loading market terminal…
          </div>
        }
      >
        <MarketScreener
          initialData={
            marketResult.status === "fulfilled" ? marketResult.value : null
          }
          categories={
            categoryResult.status === "fulfilled"
              ? categoryResult.value.data
              : []
          }
          initialQuery={initialQuery}
        />
      </Suspense>
    </main>
  );
}
