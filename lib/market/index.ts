import type { Stock, StockPriceHistory } from "@/types";
export const stocks: Stock[] = [
  [
    "AAPL",
    "Apple",
    213.07,
    1.24,
    "3.2T",
    "48.2M",
    "Apple makes iPhones, Macs, and digital services.",
    "#64748b",
  ],
  [
    "MSFT",
    "Microsoft",
    425.52,
    0.82,
    "3.1T",
    "22.8M",
    "Microsoft builds Windows, Office, cloud services, and software.",
    "#2563eb",
  ],
  [
    "NVDA",
    "NVIDIA",
    131.38,
    2.46,
    "3.2T",
    "189.4M",
    "NVIDIA designs chips used in gaming, data centers, and artificial intelligence.",
    "#65a30d",
  ],
  [
    "TSLA",
    "Tesla",
    248.5,
    -1.32,
    "798B",
    "92.3M",
    "Tesla makes electric cars, batteries, and energy products.",
    "#dc2626",
  ],
  [
    "AMZN",
    "Amazon",
    198.12,
    0.67,
    "2.1T",
    "38.1M",
    "Amazon runs an online store and cloud computing services.",
    "#d97706",
  ],
  [
    "GOOGL",
    "Alphabet",
    175.98,
    -0.48,
    "2.2T",
    "25.6M",
    "Alphabet owns Google, YouTube, and other technology businesses.",
    "#4285f4",
  ],
  [
    "META",
    "Meta",
    582.34,
    1.57,
    "1.5T",
    "16.8M",
    "Meta operates Facebook, Instagram, WhatsApp, and virtual reality products.",
    "#2563eb",
  ],
  [
    "NFLX",
    "Netflix",
    891.32,
    0.93,
    "385B",
    "4.3M",
    "Netflix provides streaming entertainment and produces shows and films.",
    "#e11d48",
  ],
  [
    "AMD",
    "AMD",
    142.68,
    -0.87,
    "230B",
    "42.8M",
    "AMD designs processors and graphics chips for computers.",
    "#7c3aed",
  ],
  [
    "SPY",
    "S&P 500 ETF",
    584.21,
    0.56,
    "600B",
    "65.4M",
    "SPY is a fund that holds shares in around 500 large US companies.",
    "#059669",
  ],
].map(([ticker, company, price, change, cap, volume, description, color]) => ({
  ticker,
  company,
  price,
  change,
  cap,
  volume,
  description,
  color,
})) as Stock[];
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
export const round = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
export function quote(ticker: string, tick = 0): Stock {
  const stock = stocks.find((s) => s.ticker === ticker);
  if (!stock) throw new Error("Choose a valid stock.");
  return {
    ...stock,
    price: round(
      stock.price *
        (1 +
          0.006 *
            Math.sin(tick * 0.9 + stocks.indexOf(stock)) *
            (tick ? 1 : 0)),
    ),
  };
}
export function history(
  ticker: string,
  range = "1M",
  tick = 0,
): StockPriceHistory[] {
  const s = quote(ticker, tick);
  const scale = (
    { "1D": 0.007, "1W": 0.02, "1M": 0.045, "3M": 0.09, "1Y": 0.18 } as Record<
      string,
      number
    >
  )[range];
  const seed = stocks.findIndex((s) => s.ticker === ticker) + 1;
  return Array.from({ length: 40 }, (_, i) => ({
    date: `${i + 1}`,
    price: round(
      s.price *
        (1 +
          scale *
            (Math.sin(i * 0.53 + seed) * 0.28 +
              ((i - 39) / 39) * (s.change > 0 ? 0.7 : -0.7) -
              Math.sin(39 * 0.53 + seed) * 0.28)),
    ),
  }));
}
export interface MarketDataProvider {
  quote: typeof quote;
  history: typeof history;
}
export const simulatedMarket: MarketDataProvider = { quote, history };
