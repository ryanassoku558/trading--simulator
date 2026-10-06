import { expect, it } from "vitest";
import { candles, history, quote, stocks } from "../lib/market";
it("produces deterministic valid OHLC bars for all stocks and timeframes", () => {
  for (const stock of stocks)
    for (const range of ["1D", "1W", "1M", "3M", "1Y"])
      for (const tick of [0, 1, 20]) {
        const bars = candles(stock.ticker, range, tick),
          points = history(stock.ticker, range, tick);
        expect(bars).toEqual(candles(stock.ticker, range, tick));
        expect(bars).toHaveLength(40);
        bars.forEach((bar, index) => {
          expect(bar.close).toBe(points[index].price);
          expect(bar.high).toBeGreaterThanOrEqual(
            Math.max(bar.open, bar.close),
          );
          expect(bar.low).toBeLessThanOrEqual(Math.min(bar.open, bar.close));
          expect(bar.low).toBeGreaterThan(0);
          if (index) expect(bar.open).toBe(bars[index - 1].close);
        });
        expect(bars.at(-1)?.close).toBe(quote(stock.ticker, tick).price);
      }
});
it("responds to advancing the market and timeframe changes", () => {
  expect(candles("AAPL", "1M", 0)).not.toEqual(candles("AAPL", "1M", 1));
  expect(candles("AAPL", "1D")).not.toEqual(candles("AAPL", "1Y"));
  expect(() => candles("INVALID")).toThrow("valid stock");
});
