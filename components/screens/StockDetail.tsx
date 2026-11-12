"use client";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {investmentHistory} from "@/lib/market";
import ConditionalOrder from "../ConditionalOrder";
import MissionBanner from "../classroom/MissionBanner";
import TradingAccountBar from "../academy/TradingAccountBar";
import HandsOnTrading from "../HandsOnTrading";
import {VideoHelp} from "../OnboardingTutorials";
import { useState } from "react";
import type { State, Trade, Stock } from "@/types";
import { money, history,marketEpoch } from "@/lib/market";
import { StockBadge, Delta } from "../ui/MarketUI";

import Chart from "../Chart";
import TradingChart from "../TradingChart";
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
  const investing=useSearchParams().get("investing")==="1";
  const [range, setRange] = useState(investing?"5Y":"LIVE");
  const [chartType, setChartType] = useState<"line" | "candles">(investing?"line":"candles");
  return (
    <div className="institutional-simulator"><MissionBanner/>
      <TradingAccountBar state={state}/>
      <div className="page-heading simulator-asset-header">
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
      <details className="simulator-learning-guides" open={guided}><summary>Learning guides · chart and order walkthroughs</summary>      <HandsOnTrading key={`hands-on-${ticker}`} state={state} ticker={ticker} start={guided}/><div className="simulator-video-help"><VideoHelp slug="simulator-guide" label="Watch the simulator guide"/></div></details><div className="detail-grid">
        <div>
          <section className="card simulator-price-card">
            <div className="simulator-price-header"><div><span className="eyebrow">{ticker} · {current.assetType||'Stock'} · USD</span><div className="stock-detail-price">{money(current.price)}</div></div><span className="simulator-data-badge">Simulated price</span></div>
            <p>
              <Delta value={current.change} percent />{" "}
              <span className="muted">simulated last 24 hours</span>
            </p>
            <div className="investment-mode-entry"><button className="secondary" onClick={()=>{setChartType("line");setRange("5Y");}}>Long-term investing view</button><Link href="/learn?view=Modules&topic=Long-term%20investing">Long-term investing journey →</Link></div>
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
              <Chart line label={`${ticker} simulated price line chart · ${range}`} data={["1Y","5Y","10Y"].includes(range)?investmentHistory(ticker,range==="10Y"?10:range==="5Y"?5:1,state.tick):history(ticker, range, state.tick)} />
            ) : (
              <TradingChart ticker={ticker} state={state} />
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
            {chartType==="line"&&<p className="small">A line connects price observations to make longer trends easier to study. This is generated practice history, including the multi-year views. It excludes dividends, fees and taxes and does not predict future results. <Link href={`/market?view=research&symbol=${encodeURIComponent(ticker)}`}>Open sourced market research →</Link></p>}
            {chartType==="line"&&<div className="range-buttons">
              {["LIVE", "1D", "1W", "1M", "3M", "1Y", "5Y", "10Y"].map((r) => (
                <button
                  className={r === range ? "active" : ""}
                  aria-pressed={r===range}
                  onClick={() => setRange(r)}
                  key={r}
                >
                  {r}
                </button>
              ))}
            </div>}
            <p className="small">
              Prices move automatically 24/7. All practice prices and chart history are simulated. <time dateTime={new Date(marketEpoch+state.tick*2000).toISOString()}>Simulation time: {new Date(marketEpoch+state.tick*2000).toLocaleString(undefined,{timeZoneName:'short'})}</time>
            </p>
          </section>
          <details className="card about-company ds-extra"><summary>Asset research & key facts</summary><p><Link href={`/market?view=research&symbol=${encodeURIComponent(ticker)}`}>Open company financials, filings and research →</Link></p>      <p className="small">Practice prices are generated estimates. <a href={`https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/`} target="_blank" rel="noopener noreferrer">Check the real market quote on Yahoo Finance →</a></p>

            <h2>{current.assetType==="Crypto"?"About this digital asset":current.assetType==="ETF"?"About this fund":"What does this company actually do?"}</h2>
            <p>{current.description}</p>
            <div className="tip">
              <Lightbulb size={20} />
              <p>
                {current.assetType === "Crypto"?"Crypto practice does not create a crypto wallet or transfer real coins. Choose an affordable fractional amount and define your risk.":current.assetType === "ETF"
                  ? "Buying an ETF means owning a share of a fund, which may hold stocks, bonds, or other assets."
                  : `Buying one share of ${current.company} means owning a tiny piece of ${current.company}.`}
              </p>
            </div>
            <h3>Company metrics</h3><p className="small">Current market capitalization and exchange trading volume are not connected here. Company research includes dated SEC-reported financials for supported US companies; check each reporting period and filing date.</p>
            <div className="company-stats">
              <div>
                <span title="The total value of all shares of a company">
                  Market cap ⓘ
                </span>
                <strong>Not connected</strong>
                {state.profile.beginner && (
                  <small>The total value of all company shares.</small>
                )}
              </div>
              <div>
                <span title="The number of shares traded in one day">
                  Daily volume ⓘ
                </span>
                <strong>Not connected</strong>
                {state.profile.beginner && (
                  <small>How many shares changed hands.</small>
                )}
              </div>
            </div>
          </details>
        </div>
        <div>
          <TradePanel
            key={ticker}
            state={state}
            ticker={ticker}
            update={update}
            onTrade={trade=>{onTrade(trade);window.dispatchEvent(new CustomEvent("sprout-trade-executed",{detail:trade}));}}
            guided={guided}
          />
          <ConditionalOrder key={`conditional-${ticker}`} state={state} ticker={ticker} update={update}/>
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
    </div>
  );
}
