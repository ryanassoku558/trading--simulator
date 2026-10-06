"use client";
import Link from "next/link";
import type { State, Trade } from "@/types";
import { money } from "@/lib/market";
import { Delta, Empty } from "../ui/MarketUI";
import { ArrowUpRight, RefreshCw } from "lucide-react";
export default function TradeHistory({
  state,
  update,
  setTrade,
  advance,
}: {
  state: State;
  update: (s: State) => void;
  setTrade: (t: Trade) => void;
  advance: () => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">EVERY TRADE IS A CHANCE TO LEARN</span>
          <h1>Your trading story</h1>
          <p>Revisit any trade to understand the numbers behind it.</p>
        </div>
      </div>
      <Link href="/practice#journal" className="secondary journal-history-link">Open trade journal & analytics <ArrowUpRight size={16}/></Link>
      <section className="card">
        <h2>Completed trades</h2>
        {state.trades.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Date",
                    "Stock",
                    "Type",
                    "Shares",
                    "Price",
                    "Total",
                    "Realized P/L",
                    "",
                  ].map((x, i) => (
                    <th key={i}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.trades.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleString()}</td>
                    <td>{t.ticker}</td>
                    <td>
                      <span className="badge">{t.side.toUpperCase()}</span>
                    </td>
                    <td>{t.shares}</td>
                    <td>{money(t.price)}</td>
                    <td>{money(t.total)}</td>
                    <td>
                      {t.side === "sell" ? <Delta value={t.realized} /> : "—"}
                    </td>
                    <td>
                      <button className="text-link" onClick={() => setTrade(t)}>
                        Explain My Trade <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="You haven’t made a trade yet."
            text="No pressure. Start with a lesson or explore a company."
            href="/market"
            label="Explore stocks"
          />
        )}
      </section>
      <section className="card">
        <h2>Limit orders</h2>
        <p className="small">
          Pending limits are checked automatically while the app is open. No funds or shares are
          reserved. Orders without sufficient resources cancel when triggered.
        </p>
        <button className="secondary" onClick={advance}>
          <RefreshCw size={16} />
          Advance market
        </button>
        {state.orders.length ? (
          <div className="order-list">
            {state.orders.map((o) => (
              <div key={o.id}>
                <span>
                  <strong>
                    {o.side.toUpperCase()} {o.shares} {o.ticker}
                  </strong>
                  <small>
                    Limit {money(o.limit)} · {o.status}
                  </small>
                </span>
                {o.status === "pending" && (
                  <button
                    className="secondary"
                    onClick={() =>
                      update({
                        ...state,
                        orders: state.orders.map((x) =>
                          x.id === o.id ? { ...x, status: "cancelled" } : x,
                        ),
                      })
                    }
                  >
                    Cancel order
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No limit orders yet.</p>
        )}
      </section>
    </>
  );
}
