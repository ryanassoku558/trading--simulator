import {expect, it} from "vitest";
import {stocks, quote, candles, clockTick, marketEpoch} from "../lib/market";
import {initialState, advanceMarket, placeLimit} from "../lib/trading";
it("has unique positive stock and ETF seeds with familiar ETFs", () => {
 expect(stocks.length).toBeGreaterThan(11000);
 expect(stocks.filter(s=>s.assetType === "ETF").length).toBeGreaterThan(5000);
 expect(new Set(stocks.map(s=>s.ticker)).size).toBe(stocks.length);
 expect(stocks.every(s=>Number.isFinite(s.price)&&s.price>0&&s.company.length>0)).toBe(true);
 for(const ticker of ["SPY","QQQ","VTI","VOO","BND","GLD"]) expect(quote(ticker).assetType).toBe("ETF");
});
it("moves through nights and weekends while keeping completed candles stable", () => {
 expect(clockTick(marketEpoch+2000)).toBe(1);
 const tick=clockTick(Date.UTC(2026,9,11,2));
 expect(quote("AAPL",tick).price).not.toBe(quote("AAPL",tick+8).price);
 expect(candles("VTI","LIVE",tick).slice(0,-1)).toEqual(candles("VTI","LIVE",tick+1).slice(0,-1));
 expect(candles("VTI","LIVE",tick+1).at(-1)?.close).toBe(quote("VTI",tick+1).price);
});

it("fills an ETF limit at the current automatic tick", () => {
 const order=placeLimit(initialState(), "VTI", "buy", 1, 300);
 const result=advanceMarket(order, 200);
 expect(result.filled).toHaveLength(1);
 expect(result.filled[0].price).toBe(quote("VTI",200).price);
 expect(result.state.orders[0].status).toBe("filled");
});
