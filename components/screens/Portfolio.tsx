"use client";
import Link from "next/link";
import type { State } from "@/types";
import { money, quote } from "@/lib/market";
import { portfolio } from "@/lib/trading";
import { Delta, Empty } from "../ui/MarketUI";
import Chart from "../Chart";
import { Plus, ArrowUpRight } from "lucide-react";
export default function Portfolio({
  state,
  p,
}: {
  state: State;
  p: ReturnType<typeof portfolio>;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEE THE WHOLE PICTURE</span>
          <h1>Your portfolio</h1>
          <p>Your cash and investments, all in one place.</p>
        </div>
        <Link href="/market" className="primary">
          <Plus size={16} />
          Make a trade
        </Link>
      </div>
      <div className="stat-grid">
        <section className="card stat featured">
          <span>Total value</span>
          <h2>{money(p.value)}</h2>
          <small>Cash + current holdings</small>
        </section>
        <section className="card stat">
          <span>Cash</span>
          <h2>{money(state.cash)}</h2>
          <small>Uninvested virtual money</small>
        </section>
        <section className="card stat">
          <span>Invested value</span>
          <h2>{money(p.invested)}</h2>
          <small>Cost basis: {money(p.cost)}</small>
        </section>
        <section className="card stat">
          <span>Total return</span>
          <h2>
            <Delta value={p.gain} />
          </h2>
          <small>
            <Delta value={p.percent} percent /> · today{" "}
            <Delta value={p.today} />
          </small>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="card">
          <h2>Portfolio performance</h2>
          <Chart
            data={
              state.snapshots.length > 1
                ? state.snapshots.map((s) => ({ date: s.date, price: s.value }))
                : [
                    { date: "Start", price: 10000 },
                    { date: "Now", price: p.value },
                  ]
            }
          />
        </section>
        <section className="card">
          <h2>Your allocation</h2>
          <div className="allocation-bar">
            <span
              style={{
                width: `${(state.cash / p.value) * 100}%`,
                background: "#14856f",
              }}
            />
            {state.holdings.map((h, i) => (
              <span
                key={h.ticker}
                style={{
                  width: `${((h.shares * quote(h.ticker, state.tick).price) / p.value) * 100}%`,
                  background: ["#68bfa8", "#e3b562", "#7b91ca", "#c586c1"][
                    i % 4
                  ],
                }}
              />
            ))}
          </div>
          <div className="allocation-list">
            <div>
              <span>Cash</span>
              <strong>{((state.cash / p.value) * 100).toFixed(1)}%</strong>
            </div>
            {state.holdings.map((h) => (
              <div key={h.ticker}>
                <span>{h.ticker}</span>
                <strong>
                  {(
                    ((h.shares * quote(h.ticker, state.tick).price) / p.value) *
                    100
                  ).toFixed(1)}
                  %
                </strong>
              </div>
            ))}
          </div>
          <p className="small">
            Allocation shows where your virtual money is. It is not an
            investment recommendation.
          </p>
        </section>
      </div>
      <section className="card">
        <h2>Your holdings</h2>
        {state.holdings.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Stock",
                    "Shares",
                    "Average cost",
                    "Current price",
                    "Value",
                    "Return",
                    "Allocation",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.holdings.map((h) => {
                  const price = quote(h.ticker, state.tick).price;
                  return (
                    <tr key={h.ticker}>
                      <td>
                        <Link
                          href={`/market/${h.ticker}`}
                          className="text-link"
                        >
                          {h.ticker}
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                      <td>{h.shares}</td>
                      <td>{money(h.averageCost)}</td>
                      <td>{money(price)}</td>
                      <td>{money(h.shares * price)}</td>
                      <td>
                        <Delta value={(price - h.averageCost) * h.shares} />
                        <small>
                          <Delta
                            value={(price / h.averageCost - 1) * 100}
                            percent
                          />
                        </small>
                      </td>
                      <td>
                        {(((h.shares * price) / p.value) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Your portfolio is all cash right now."
            text="Your first practice trade will appear here."
            href="/market"
            label="Explore the market"
          />
        )}
      </section>
    </>
  );
}
