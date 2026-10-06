"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { State } from "@/types";
import { stocks, quote, money, history } from "@/lib/market";
import { StockBadge, Delta, Empty } from "../ui/MarketUI";

import Chart from "../Chart";
import PortfolioCoach from "../PortfolioCoach";

import { Search, RefreshCw, ArrowUpRight } from "lucide-react";
export default function Market({
  state,
  advance,
}: {
  state: State;
  advance: () => void;
}) {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [view, setView] = useState<"table" | "cards">("table");
  const [sort, setSort] = useState("symbol");
  const [asset, setAsset] = useState("All");
  const [page, setPage] = useState(0);
  const exact = stocks.find(s => s.ticker === search.trim().toUpperCase());
  const filtered = stocks
    .filter((s) =>
      (asset === "All" || s.assetType === asset) && (exact ? s.ticker === exact.ticker : `${s.ticker} ${s.company}`.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) =>
      sort === "price"
        ? quote(b.ticker, state.tick).price - quote(a.ticker, state.tick).price
        : sort === "change"
          ? quote(b.ticker, state.tick).change - quote(a.ticker, state.tick).change
          : a.ticker.localeCompare(b.ticker),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 50));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * 50, currentPage * 50 + 50);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MARKET WORKSPACE</span>
          <h1>Markets & research.</h1>
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
      <PortfolioCoach state={state}/>
      <div className="market-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Search stocks"
            placeholder="Search by company or ticker"
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(0);}}
          />
        </label>
        <div className="market-controls">
          <select aria-label="Asset type" value={asset} onChange={e => {setAsset(e.target.value); setPage(0);}}>
            <option>All</option><option>Stock</option><option>ETF</option>
          </select>
          <select
            aria-label="Sort market"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="symbol">Symbol A–Z</option>
            <option value="price">Price: high to low</option>
            <option value="change">Change: high to low</option>
          </select>
          <div
            className="chart-type-buttons"
            role="group"
            aria-label="Market view"
          >
            <button
              aria-pressed={view === "table"}
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              aria-pressed={view === "cards"}
              className={view === "cards" ? "active" : ""}
              onClick={() => setView("cards")}
            >
              Cards
            </button>
          </div>
        </div>
      </div>
      <div className="market-results-label">
        <span>{filtered.length} securities</span>
        <span>SIMULATED · UPDATES EVERY 2 SECONDS · 24/7</span>
      </div>
      {view === "table" ? (
        <section className="card market-table-card">
          <div className="table-scroll">
            <table aria-label="Simulated stock market">
              <thead>
                <tr>
                  <th>Security</th>
                  <th>Price</th>
                  <th>24h simulated change</th>
                  <th>1M trend</th>
                  <th>Market cap</th>
                  <th>Daily volume</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const q = quote(s.ticker, state.tick),
                    points = history(s.ticker, "1M", state.tick),
                    min = Math.min(...points.map((p) => p.price)),
                    max = Math.max(...points.map((p) => p.price));
                  return (
                    <tr key={s.ticker} className="market-card">
                      <td>
                        <Link
                          className="security-link"
                          href={`/market/${s.ticker}`}
                        >
                          <StockBadge ticker={s.ticker} />
                          <span>
                            <strong>{s.ticker}</strong>
                            <small>{s.assetType} · {s.company}</small>
                          </span>
                        </Link>
                      </td>
                      <td className="quote-cell">{money(q.price)}</td>
                      <td>
                        <Delta value={q.change} percent />
                      </td>
                      <td>
                        <svg
                          className="table-spark"
                          viewBox="0 0 100 32"
                          role="img"
                          aria-label={`${s.ticker} illustrative monthly trend`}
                        >
                          <polyline
                            points={points
                              .map(
                                (p, i) =>
                                  `${(i * 100) / (points.length - 1)},${29 - ((p.price - min) / (max - min || 1)) * 26}`,
                              )
                              .join(" ")}
                            fill="none"
                            stroke={q.change >= 0 ? "#147448" : "#bc4545"}
                            strokeWidth="1.8"
                          />
                        </svg>
                      </td>
                      <td>{s.cap}</td>
                      <td>{s.volume}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="market-grid">
          {visible.map((s) => {
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
      )}
      <div className="market-pagination">
        <button className="secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage-1)}>Previous</button>
        <span>Page {currentPage+1} of {pages.toLocaleString()}</span>
        <button className="secondary" disabled={currentPage+1 === pages} onClick={() => setPage(currentPage+1)}>Next</button>
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
