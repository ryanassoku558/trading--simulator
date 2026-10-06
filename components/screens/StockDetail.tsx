"use client";
import Link from "next/link";
import { useState } from "react";
import type { State, Trade, Stock } from "@/types";
import { money, history } from "@/lib/market";
import { StockBadge, Delta } from "../ui/MarketUI";

import Chart from "../Chart";
import { TradePanel } from "../Trading";
import { RefreshCw, Star, Lightbulb, BookOpen } from "lucide-react";
export default function StockDetail({
  state,
  ticker,
  current,
  advance,
  watch,
  update,
  onTrade,
  guided,
}: {
  state: State;
  ticker: string;
  current: Stock;
  advance: () => void;
  watch: (t: string) => void;
  update: (s: State) => void;
  onTrade: (t: Trade) => void;
  guided: boolean;
}) {
  const [range, setRange] = useState("1M");
  return (
    <>
      <div className="page-heading">
        <div className="stock-detail-heading">
          <StockBadge ticker={ticker} />
          <div>
            <span className="eyebrow">{ticker} · SIMULATED MARKET DATA</span>
            <h1>{current.company}</h1>
          </div>
        </div>
        <div className="hero-buttons">
          <button className="secondary" onClick={() => watch(ticker)}>
            <Star
              size={16}
              fill={state.watchlist.includes(ticker) ? "currentColor" : "none"}
            />
            {state.watchlist.includes(ticker) ? "Watching" : "Add to watchlist"}
          </button>
          <button className="secondary" onClick={advance}>
            <RefreshCw size={16} />
            Advance market
          </button>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <section className="card">
            <div className="stock-detail-price">{money(current.price)}</div>
            <p>
              <Delta value={current.change} percent />{" "}
              <span className="muted">simulated today</span>
            </p>
            <Chart data={history(ticker, range, state.tick)} />
            <div className="range-buttons">
              {["1D", "1W", "1M", "3M", "1Y"].map((r) => (
                <button
                  className={r === range ? "active" : ""}
                  onClick={() => setRange(r)}
                  key={r}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="small">
              Deterministic illustrative history. Not actual historical market
              prices.
            </p>
          </section>
          <section className="card about-company">
            <h2>What does this company actually do?</h2>
            <p>{current.description}</p>
            <div className="tip">
              <Lightbulb size={20} />
              <p>
                {ticker === "SPY"
                  ? "Buying SPY means owning a share of a fund that holds many companies."
                  : `Buying one share of ${current.company} means owning a tiny piece of ${current.company}.`}
              </p>
            </div>
            <h3>At a glance</h3>
            <div className="company-stats">
              <div>
                <span title="The total value of all shares of a company">
                  Market cap ⓘ
                </span>
                <strong>{current.cap}</strong>
                {state.profile.beginner && (
                  <small>The total value of all company shares.</small>
                )}
              </div>
              <div>
                <span title="The number of shares traded in one day">
                  Daily volume ⓘ
                </span>
                <strong>{current.volume}</strong>
                {state.profile.beginner && (
                  <small>How many shares changed hands.</small>
                )}
              </div>
            </div>
          </section>
        </div>
        <div>
          <TradePanel
            key={ticker}
            state={state}
            ticker={ticker}
            update={update}
            onTrade={onTrade}
            guided={guided}
          />
          {state.profile.beginner && (
            <div className="tip advanced-tip">
              <BookOpen size={20} />
              <span>
                New to orders?{" "}
                <Link href="/learn">Try the Placing Trades lessons</Link> before
                exploring limit orders.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
