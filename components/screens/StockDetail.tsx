"use client";
import Link from "next/link";
import { useState } from "react";
import type { State, Trade, Stock } from "@/types";
import { money, history, candles } from "@/lib/market";
import { StockBadge, Delta } from "../ui/MarketUI";

import Chart from "../Chart";
import CandlestickChart from "../CandlestickChart";
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
  const [range, setRange] = useState("LIVE");
  const [chartType, setChartType] = useState<"line" | "candles">("candles");
  return (
    <>
      <div className="page-heading">
        <div className="stock-detail-heading">
          <StockBadge ticker={ticker} />
          <div>
            <span className="eyebrow">{ticker} · SIMULATED · 24/7 · UPDATES EVERY 2 SECONDS</span>
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
      <p className="small">Practice prices are generated estimates. <a href={`https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/`} target="_blank" rel="noopener noreferrer">Check the real market quote on Yahoo Finance →</a></p>
      <div className="detail-grid">
        <div>
          <section className="card">
            <div className="stock-detail-price">{money(current.price)}</div>
            <p>
              <Delta value={current.change} percent />{" "}
              <span className="muted">simulated last 24 hours</span>
            </p>
            <div
              className="chart-type-buttons"
              role="group"
              aria-label="Chart style"
            >
              <button
                className={chartType === "line" ? "active" : ""}
                aria-pressed={chartType === "line"}
                onClick={() => setChartType("line")}
              >
                Line chart
              </button>
              <button
                className={chartType === "candles" ? "active" : ""}
                aria-pressed={chartType === "candles"}
                onClick={() => setChartType("candles")}
              >
                Candlesticks
              </button>
            </div>
            {chartType === "line" ? (
              <Chart data={history(ticker, range, state.tick)} />
            ) : (
              <CandlestickChart data={candles(ticker, range, state.tick)} />
            )}
            {chartType === "candles" && (
              <p className="small">
                Each candle shows one simulated period. The body connects
                opening and closing prices; the wicks show the highest and
                lowest prices. Green closes higher, red closes lower.{" "}
                <Link className="text-link" href="/learn?lesson=26">
                  Learn to read candlesticks →
                </Link>
              </p>
            )}
            <div className="range-buttons">
              {["LIVE", "1D", "1W", "1M", "3M", "1Y"].map((r) => (
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
              LIVE shows 30-second candles across 20 minutes. Prices move automatically 24/7. All prices and history are simulated.
            </p>
          </section>
          <section className="card about-company">
            <h2>What does this company actually do?</h2>
            <p>{current.description}</p>
            <div className="tip">
              <Lightbulb size={20} />
              <p>
                {current.assetType === "ETF"
                  ? "Buying an ETF means owning a share of a fund, which may hold stocks, bonds, or other assets."
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
