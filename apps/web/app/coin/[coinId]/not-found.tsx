import Link from "next/link";

export default function CoinNotFound() {
  return (
    <main className="shell main-content">
      <div className="terminal-panel state-card">
        <span>?</span>
        <h1>Asset not found</h1>
        <p>
          The asset may have been removed or the market-data service may be
          unavailable.
        </p>
        <Link className="primary-button" href="/">
          Return to markets
        </Link>
      </div>
    </main>
  );
}
