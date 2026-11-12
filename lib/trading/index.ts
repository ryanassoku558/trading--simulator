import {isCryptoTicker} from "@/lib/market/crypto";
import {validAssetQuantity,normalizeQuantity} from "@/lib/market/quantity";
import type { State, Trade } from "@/types";
import { quote, round, marketEpoch } from "@/lib/market";
export function initialState(): State {
  return {
    profile: {
      id: "local",
      name: "Guest",
      experience: "new",
      beginner: true,
      onboarded: false,
      joinedAt: new Date().toISOString(),
    },
    cash: 10000,
    holdings: [],
    trades: [],
    orders: [],
    watchlist: ["AAPL", "MSFT", "NVDA", "SPY"],
    tick: 0,
    snapshots: [{ date: "Start", value: 10000 }],
    learning: { completed: [], attempts: [], xp: 0, streak: 0, lastDay: "" },
  };
}
export function portfolio(s: State) {
  const invested = round(
    s.holdings.reduce(
      (n, h) => n + h.shares * quote(h.ticker, s.tick).price,
      0,
    ),
  );
  const cost = round(
    s.holdings.reduce((n, h) => n + h.shares * h.averageCost, 0),
  );
  const value = round(s.cash + invested),
    startingCapital = 10000 + (s.referralDeposits??0) + (s.simulatorDeposits??0),
    gain = round(value - startingCapital);
  const today = round(
    s.holdings.reduce((n, h) => {
      const q = quote(h.ticker, s.tick);
      return n + h.shares * (q.price - q.price / (1 + q.change / 100));
    }, 0),
  );
  return {
    invested,
    cost,
    value,
    gain,
    startingCapital,
    percent: gain / startingCapital * 100,
    today,
    unrealized: round(invested - cost),
  };
}
export function executeTrade(
  s: State,
  ticker: string,
  side: "buy" | "sell",
  shares: number,
): { state: State; trade: Trade } {
  if (!validAssetQuantity(ticker,shares))
    throw new Error(isCryptoTicker(ticker)?"Enter a crypto amount with up to six decimal places.":"Enter a whole number of shares greater than zero.");
  const price = quote(ticker, s.tick).price,
    total = round(price * shares);
  if(total<.01)throw new Error("The practice order must be worth at least $0.01.");
  const old = s.holdings.find((h) => h.ticker === ticker);
  if (side === "buy" && total > s.cash)
    throw new Error("You don’t have enough virtual cash. Try fewer shares.");
  if (side === "sell" && (!old || old.shares < shares))
    throw new Error("You can only sell shares you own.");
  const holdings = s.holdings.filter((h) => h.ticker !== ticker);
  if (side === "buy")
    holdings.push({
      ticker,
      shares: normalizeQuantity(ticker,(old?.shares || 0) + shares),
      averageCost:
        ((old?.shares || 0) * (old?.averageCost || 0) + total) /
        ((old?.shares || 0) + shares),
    });
  else if (old && old.shares > shares)
    holdings.push({ ...old, shares: normalizeQuantity(ticker,old.shares - shares) });
  const trade: Trade = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ticker,
    side,
    shares,
    price,
    total,
    realized:
      side === "sell" ? round((price - (old?.averageCost || 0)) * shares) : 0,
    portfolioValue: portfolio(s).value,
  };
  const state = {
    ...s,
    cash: round(s.cash + (side === "buy" ? -total : total)),
    holdings,
    trades: [trade, ...s.trades],
    learning: {
      ...s.learning,
      xp: s.learning.xp + (s.trades.length === 0 ? 50 : 0),
    },
  };
  return {
    state: {
      ...state,
      snapshots: [
        ...s.snapshots,
        {
          date: new Date().toLocaleTimeString(),
          value: portfolio(state).value,
        },
      ],
    },
    trade,
  };
}
export function scenarios(trade: Trade) {
  return [-10, -5, 5, 10].map((percent) => ({
    percent,
    price: round(trade.price * (1 + percent / 100)),
    value: round(trade.total * (1 + percent / 100)),
    profit: round((trade.total * percent) / 100),
  }));
}
export function placeLimit(
  s: State,
  ticker: string,
  side: "buy" | "sell",
  shares: number,
  limit: number,
): State {
  if (!Number.isFinite(limit) || limit <= 0)
    throw new Error("Enter a positive limit price.");
  quote(ticker, s.tick);
  if (!validAssetQuantity(ticker,shares))
    throw new Error(isCryptoTicker(ticker)?"Enter a crypto amount with up to six decimal places.":"Enter a whole number of shares greater than zero.");
  if (
    side === "sell" &&
    (s.holdings.find((h) => h.ticker === ticker)?.shares || 0) < shares
  )
    throw new Error("You can only sell shares you own.");
  if(round(limit*shares)<.01)throw new Error("The practice order must be worth at least $0.01.");
  if (side === "buy" && round(limit * shares) > s.cash)
    throw new Error("The limit order exceeds your available cash.");
  return {
    ...s,
    orders: [
      {
        id: crypto.randomUUID(),
        ticker,
        side,
        shares,
        limit,
        status: "pending",
        date: new Date().toISOString(),
      },
      ...s.orders,
    ],
  };
}
/** Stop/trailing orders are evaluated on observed generated ticks while the app is open. */
export function placeConditional(s:State,ticker:string,side:"buy"|"sell",shares:number,kind:"stop"|"trailing-stop",amount:number,expiresIn24Hours=false):State{
 if(!Number.isFinite(amount)||amount<=0)throw new Error("Enter a positive trigger or trailing amount.");
 const anchor=quote(ticker,s.tick).price;
 const trigger=kind==="stop"?amount:round(side==="sell"?anchor-amount:anchor+amount);
 if(trigger<=0)throw new Error("A sell trailing amount must be below the current price.");
 const next=placeLimit(s,ticker,side,shares,trigger);
 next.orders[0]={...next.orders[0],kind,...(kind==="trailing-stop"?{trailingAmount:amount,anchor}:{}),...(expiresIn24Hours?{expiresAt:new Date(marketEpoch+s.tick*2000+86400000).toISOString()}: {})};
 return next;
}
export function advanceMarket(s: State, tick = s.tick + 1): { state: State; filled: Trade[] } {
  let next = { ...s, tick };
  const filled: Trade[] = [];
  for (let order of next.orders.filter((o) => o.status === "pending")) {
    if(order.expiresAt&&marketEpoch+next.tick*2000>=Date.parse(order.expiresAt)){next={...next,orders:next.orders.map(o=>o.id===order.id?{...o,status:"cancelled",reason:"24-hour practice term expired"}:o)};continue;}
    const price = quote(order.ticker, next.tick).price;
    if(order.kind==="trailing-stop"){
      const anchor=order.side==="sell"?Math.max(order.anchor!,price):Math.min(order.anchor!,price);
      order={...order,anchor,limit:round(order.side==="sell"?anchor-order.trailingAmount!:anchor+order.trailingAmount!)};
      next={...next,orders:next.orders.map(o=>o.id===order.id?order:o)};
    }
    const stop=order.kind==="stop"||order.kind==="trailing-stop";
    const triggered=stop?(order.side==="buy"?price>=order.limit:price<=order.limit):(order.side==="buy"?price<=order.limit:price>=order.limit);
    if (triggered) {
      try {
        const result = executeTrade(
          next,
          order.ticker,
          order.side,
          order.shares,
        );
        next = result.state;
        filled.push(result.trade);
        next = {
          ...next,
          orders: next.orders.map((o) =>
            o.id === order.id ? { ...o, status: "filled" } : o,
          ),
        };
      } catch {
        next = {
          ...next,
          orders: next.orders.map((o) =>
            o.id === order.id ? { ...o, status: "cancelled", reason:"Insufficient cash or holdings at trigger" } : o,
          ),
        };
      }
    }
  }
  return {
    state: {
      ...next,
      snapshots: [
        ...next.snapshots,
        { date: `Tick ${next.tick}`, value: portfolio(next).value },
      ],
    },
    filled,
  };
}

export function resetSimulator(s: State): State {
  const fresh = initialState();
  return {
    ...s,
    journal: [],
    challenge: undefined,
    returnGoal: undefined,
    referralDeposits: 0,
    simulatorDeposits: 0,
    moods: [],
    cash: fresh.cash,
    holdings: [],
    trades: [],
    orders: [],
    tick: 0,
    snapshots: fresh.snapshots,
  };
}
export function resetLearning(s: State): State {
  return { ...s, learning: initialState().learning };
}
