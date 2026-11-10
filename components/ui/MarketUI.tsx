"use client";
import Link from "next/link";
import { Sprout, ChartNoAxesCombined, ArrowRight } from "lucide-react";
import type { State } from "@/types";
import { stocks, quote, money, history } from "@/lib/market";
export function StockBadge({ ticker }: { ticker: string }) {
  const stock = stocks.find((s) => s.ticker === ticker)!;
  return (
    <span
      className="stock-badge"
      style={{ background: stock.color + "12", color: stock.color }}
    >
      {ticker === "SPY" ? (
        <ChartNoAxesCombined size={21} />
      ) : (
        ticker.slice(0, 1)
      )}
    </span>
  );
}
export function Delta({
  value,
  percent = false,
}: {
  value: number;
  percent?: boolean;
}) {
  return (
    <span className={value >= 0 ? "positive" : "negative"}>
      {value >= 0 ? "+" : ""}
      {percent ? `${value.toFixed(2)}%` : money(value)}
    </span>
  );
}
export function Empty({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Sprout size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href} className="text-link">
        {label}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function StockRows({
  state,
  tickers,
}: {
  state: State;
  tickers: string[];
}) {
  return (
    <div className="stock-rows">
      {tickers.map((t) => {
        const s = quote(t, state.tick);
        return (
          <Link href={`/market/${t}`} className="stock-row" key={t}>
            <StockBadge ticker={t} />
            <span className="stock-name">
              <strong>{t}</strong>
              <small>{s.company}</small>
            </span>
            <span
              className="mini-spark"
              style={{ color: s.change >= 0 ? "#14856f" : "#d05b62" }}
            >
              <svg viewBox="0 0 90 30" aria-hidden="true">
                <polyline
                  points={history(t, "1D", state.tick)
                    .filter((_, i) => i % 4 === 0)
                    .map(
                      (h, i) =>
                        `${i * 10},${28 - (h.price / s.price - 0.99) * 1200}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="stock-price">
              <strong>{money(s.price)}</strong>
              <small>
                <Delta value={s.change} percent />
              </small>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
