"use client";
import Link from "next/link";
import { useState } from "react";
import type { State } from "@/types";
import { stocks, quote, money, history } from "@/lib/market";
import { StockBadge, Delta, Empty } from "../ui/MarketUI";

import Chart from "../Chart";

import { Search, RefreshCw, ArrowUpRight } from "lucide-react";
export default function Market({
  state,
  advance,
}: {
  state: State;
  advance: () => void;
}) {
  const [search, setSearch] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">GET TO KNOW THE COMPANIES</span>
          <h1>A market made for exploring.</h1>
          <p>
            Real companies. Simulated prices. Find a business you’re curious
            about.
          </p>
        </div>
        <button className="secondary" onClick={advance}>
          <RefreshCw size={16} />
          Advance market
        </button>
      </div>
      <div className="market-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Search stocks"
            placeholder="Search by company or ticker"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="badge">SIMULATED PRICES · TICK {state.tick}</span>
      </div>
      <div className="market-grid">
        {stocks
          .filter((s) =>
            `${s.ticker} ${s.company}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((s) => {
            const q = quote(s.ticker, state.tick);
            return (
              <Link
                className="card market-card"
                href={`/market/${s.ticker}`}
                key={s.ticker}
              >
                <div className="card-heading">
                  <StockBadge ticker={s.ticker} />
                  <ArrowUpRight size={18} />
                </div>
                <h2>{s.company}</h2>
                <span className="muted">{s.ticker}</span>
                <div className="market-price">
                  <strong>{money(q.price)}</strong>
                  <Delta value={q.change} percent />
                </div>
                <Chart
                  data={history(s.ticker, "1M", state.tick)}
                  color={s.change >= 0 ? "#14856f" : "#d05b62"}
                />
                <p>{s.description}</p>
              </Link>
            );
          })}
      </div>
      {!stocks.some((s) =>
        `${s.ticker} ${s.company}`.toLowerCase().includes(search.toLowerCase()),
      ) && (
        <Empty
          title="No stocks found"
          text="Try a ticker like AAPL or a company like Apple."
          href="/market"
          label="Browse the market"
        />
      )}
    </>
  );
}
