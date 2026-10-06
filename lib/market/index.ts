import type { Stock, StockPriceHistory, PriceCandle } from "@/types";
import catalog from "./data/us-securities.json";
const featured: Stock[] = [
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
const featuredMap = new Map(featured.map(s => [s.ticker, s]));
export const stocks: Stock[] = catalog.map(([ticker, company, type, price]) => ({
  ticker: String(ticker), company: String(company), price: Number(price), change: 0,
  cap: "Unavailable", volume: "Unavailable", color: "#147448",
  description: `${company}. ${type === "ETF" ? "An exchange-traded fund." : "A US-listed company."}`,
  ...featuredMap.get(String(ticker)), assetType: type === "ETF" ? "ETF" : "Stock",
}));
const stockMap = new Map(stocks.map(s => [s.ticker, s]));
export const marketEpoch = Date.UTC(2026, 9, 6);
export function clockTick(now = Date.now()) { return Math.max(0, Math.floor((now - marketEpoch) / 2000)); }
const seeds = new Map(stocks.map(s => [s.ticker, Array.from(s.ticker).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % 1000]));
function priceAt(stock: Stock, tick: number) {
  const seed = seeds.get(stock.ticker)!;
  const motion = (t: number) => .025 * Math.sin(t * .019 + seed) + .012 * Math.sin(t * .061 + seed * .7) + .004 * Math.sin(t * .31 + seed * 1.1);
  return Math.max(.01, round(stock.price * (1 + motion(tick) - motion(0))));
}
let cachedTick = -1;
const quoteCache = new Map<string, Stock>();
export function quote(ticker: string, tick = 0): Stock {
  if (tick !== cachedTick) {quoteCache.clear(); cachedTick = tick;}
  const cached = quoteCache.get(ticker);
  if (cached) return cached;
  const stock = stockMap.get(ticker);
  if (!stock) throw new Error("Choose a valid stock.");
  const price = priceAt(stock, tick);
  const result = {...stock, price, change: round((price / priceAt(stock, tick - 43200) - 1) * 100)};
  quoteCache.set(ticker, result);
  return result;
}
function windows(range: string, tick: number) {
  const width = ({LIVE: 15, "1D": 1080, "1W": 7560, "1M": 32400, "3M": 97200, "1Y": 394200} as Record<string, number>)[range] ?? 32400;
  const current = Math.floor(tick / width) * width;
  return Array.from({length: 40}, (_, i) => ({start: current - (39-i)*width, end: i === 39 ? tick : current - (38-i)*width}));
}
export function history(ticker: string, range = "1M", tick = 0): StockPriceHistory[] {
  const stock = stockMap.get(ticker);
  if (!stock) throw new Error("Choose a valid stock.");
  return windows(range, tick).map((w, i) => ({date: String(i+1), price: priceAt(stock, w.end)}));
}
export function candles(ticker: string, range = "1M", tick = 0): PriceCandle[] {
  const stock = stockMap.get(ticker);
  if (!stock) throw new Error("Choose a valid stock.");
  return windows(range, tick).map((w, i) => {
    const samples = Array.from({length: 17}, (_, j) => priceAt(stock, w.start + (w.end-w.start)*j/16));
    return {period: String(i+1), open: samples[0], close: samples[16], high: Math.max(...samples), low: Math.min(...samples)};
  });
}
export interface MarketDataProvider { quote: typeof quote; history: typeof history; candles: typeof candles; }
export const simulatedMarket: MarketDataProvider = {quote, history, candles};
