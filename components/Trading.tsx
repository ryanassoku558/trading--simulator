"use client";
import { useState } from "react";
import type { State, Trade } from "@/types";
import { quote, money } from "@/lib/market";
import { executeTrade, placeLimit, portfolio, scenarios } from "@/lib/trading";
import Dialog from "./Dialog";
export function TradePanel({
  state,
  ticker,
  update,
  onTrade,
  guided = false,
}: {
  state: State;
  ticker: string;
  update: (s: State) => void;
  onTrade: (t: Trade) => void;
  guided?: boolean;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy"),
    [shares, setShares] = useState("1"),
    [type, setType] = useState("market"),
    [limit, setLimit] = useState(""),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false),
    [notice, setNotice] = useState("");
  const stock = quote(ticker, state.tick),
    count = Number(shares),
    price = type === "limit" ? Number(limit) : stock.price,
    total = price * count,
    owned = state.holdings.find((h) => h.ticker === ticker)?.shares || 0;
  function submit() {
    setError("");
    setNotice("");
    try {
      if (type === "limit") {
        update(placeLimit(state, ticker, side, count, Number(limit)));
        setNotice(
          "Limit order placed. Use “Advance market” to check for a fill.",
        );
      } else {
        const result = executeTrade(state, ticker, side, count);
        update(result.state);
        onTrade(result.trade);
      }
      setConfirm(false);
    } catch (e) {
      setError((e as Error).message);
      setConfirm(false);
    }
  }
  return (
    <section className="card trade-panel">
      <div className="eyebrow">
        {guided ? "YOUR FIRST PRACTICE TRADE" : "PRACTICE ORDER"}
      </div>
      <h2>{guided ? "Let’s buy your first share." : "Make your move."}</h2>
      {guided && (
        <p>
          1. You chose Apple.
          <br />
          2. One share costs {money(stock.price)}.<br />
          3. Choose one share below.
          <br />
          4. Review your remaining cash.
          <br />
          5. Confirm, then explore your trade.
        </p>
      )}
      <div className="segmented">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            className={side === s ? "selected" : ""}
            onClick={() => {
              setSide(s);
              setError("");
            }}
          >
            {s === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (state.profile.beginner) {
            try {
              if (type === "limit")
                placeLimit(state, ticker, side, count, Number(limit));
              else executeTrade(state, ticker, side, count);
              setConfirm(true);
            } catch (e) {
              setError((e as Error).message);
            }
          } else submit();
        }}
      >
        <label>
          Order type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="market">Market · fills immediately</option>
            <option value="limit">Limit · waits for your price</option>
          </select>
        </label>
        {type === "limit" && (
          <>
            <label>
              Limit price ($)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </label>
            <p className="small">
              Limit orders aren’t guaranteed to fill. Cash and shares are not
              reserved; unavailable orders cancel at execution.
            </p>
          </>
        )}
        <label>
          Number of shares
          <input
            type="number"
            min="1"
            step="1"
            required
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />
        </label>
        <div className="order-summary">
          <div>
            <span>Price per share</span>
            <strong>{money(stock.price)}</strong>
          </div>
          <div>
            <span>Estimated {side === "buy" ? "cost" : "proceeds"}</span>
            <strong>{Number.isFinite(total) ? money(total) : "—"}</strong>
          </div>
          <div>
            <span>
              {type === "limit" ? "Cash if filled" : "Cash after trade"}
            </span>
            <strong>
              {Number.isFinite(total)
                ? money(state.cash + (side === "buy" ? -total : total))
                : "—"}
            </strong>
          </div>
          <div>
            <span>Account portion</span>
            <strong>
              {Number.isFinite(total)
                ? ((total / portfolio(state).value) * 100).toFixed(1)
                : "0"}
              %
            </strong>
          </div>
          <div>
            <span>Shares owned</span>
            <strong>{owned}</strong>
          </div>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="success">
            {notice}
          </p>
        )}
        <button className="primary full" type="submit">
          {type === "limit" ? "Place limit order" : `Review ${side}`} {ticker}
        </button>
        <p className="small center">
          Virtual money only. No real trade is placed.
        </p>
      </form>
      {confirm && (
        <Dialog
          title="Review your practice trade"
          onClose={() => setConfirm(false)}
        >
          <p>
            You’re about to {type === "limit" ? "place a limit order to " : ""}
            {side} {count} share{count === 1 ? "" : "s"} of {stock.company} for{" "}
            {money(total)}.
          </p>
          <p>
            {type === "limit"
              ? "If this order fills at the limit, your cash will be"
              : "Your cash will be"}{" "}
            {money(state.cash + (side === "buy" ? -total : total))}. Stock
            prices can rise or fall.
          </p>
          <button className="primary full" onClick={submit}>
            {type === "limit" ? "Confirm limit order" : `Confirm ${side}`}
          </button>
        </Dialog>
      )}
    </section>
  );
}
export function ExplainTrade({
  trade,
  onClose,
}: {
  trade: Trade;
  onClose: () => void;
}) {
  const percent = (trade.total / trade.portfolioValue) * 100;
  return (
    <Dialog title="Explain My Trade" onClose={onClose}>
      <div className="celebrate">✓</div>
      <div className="eyebrow center">PRACTICE MAKES PROGRESS</div>
      <h3 className="center">
        You {trade.side === "buy" ? "bought" : "sold"} {trade.shares} share
        {trade.shares === 1 ? "" : "s"} of {trade.ticker}.
      </h3>
      <p>
        At {money(trade.price)} per share, you{" "}
        {trade.side === "buy" ? "invested" : "received"} {money(trade.total)} in
        virtual money.
      </p>
      {trade.side === "sell" && (
        <p>
          Realized {trade.realized >= 0 ? "profit" : "loss"}:{" "}
          <strong>{money(trade.realized)}</strong>. The examples below describe
          a hypothetical position at your sale price, not a position you still
          own.
        </p>
      )}
      <div className="tip">
        This trade represents {percent.toFixed(1)}% of your account. A smaller
        position has less effect on the account than investing most of it. You
        can still lose the full amount in a stock.
      </div>
      <h3>What could a price change mean?</h3>
      <div className="scenario-grid">
        {scenarios(trade).map((s) => (
          <div
            key={s.percent}
            className={
              s.percent > 0 ? "scenario positive" : "scenario negative"
            }
          >
            <strong>
              {s.percent > 0 ? "+" : ""}
              {s.percent}% move
            </strong>
            <span>Share price: {money(s.price)}</span>
            <span>Position value: {money(s.value)}</span>
            <b>
              {s.profit > 0 ? "Profit" : "Loss"}: {money(Math.abs(s.profit))}
            </b>
          </div>
        ))}
      </div>
      <p className="small">
        Examples only, not predictions or financial advice. Prices can move
        beyond these amounts.
      </p>
      <button className="primary full" onClick={onClose}>
        Got it · keep exploring
      </button>
    </Dialog>
  );
}
