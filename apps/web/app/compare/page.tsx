import { CompareTerminal } from "@/components/compare-terminal";

export const metadata = { title: "Compare assets" };

export default function ComparePage() {
  return (
    <main className="shell main-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Comparison lab</p>
          <h1>Compare return and risk.</h1>
          <p>
            Normalize performance across assets and evaluate volatility,
            drawdown, and correlation.
          </p>
        </div>
      </section>
      <CompareTerminal />
    </main>
  );
}
