import Link from "next/link";
import { quote, money } from "@/lib/market";
export default function MarketTicker({ tick }: { tick: number }) {
  return (
    <div className="market-tape" aria-label="Simulated market quotes">
      <div className="tape-label">
        <span className="live-dot" />
        <strong>MARKET SNAPSHOT</strong>
        <small>SIMULATED</small>
      </div>
      <div className="tape-quotes">
        {["SPY", "AAPL", "MSFT", "NVDA", "TSLA"].map((t) => {
          const q = quote(t, tick);
          return (
            <Link href={`/market/${t}`} key={t}>
              <strong>{t}</strong>
              <span>{money(q.price)}</span>
              <b className={q.change >= 0 ? "positive" : "negative"}>
                {q.change >= 0 ? "+" : ""}
                {q.change.toFixed(2)}%
              </b>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
