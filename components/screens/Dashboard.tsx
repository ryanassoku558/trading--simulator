"use client";
import Link from "next/link";
import type { State, Trade, Lesson } from "@/types";
import { money } from "@/lib/market";
import { portfolio } from "@/lib/trading";
import { StockRows, Delta, Empty } from "../ui/MarketUI";
import Chart from "../Chart";
import {
  Plus,
  Wallet,
  TrendingUp,
  ChartNoAxesCombined,
  ShieldCheck,
  GraduationCap,
  Flame,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { levels } from "@/lib/education";
export default function Dashboard({
  state,
  p,
  nextLesson,
  progress,
  setTrade,
  firstTrade,
}: {
  state: State;
  p: ReturnType<typeof portfolio>;
  nextLesson: Lesson;
  progress: number;
  setTrade: (t: Trade) => void;
  firstTrade: () => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LEARN. PRACTICE. GROW.</span>
          <h1>
            A little wiser. A little wealthier
            <span className="heading-dot">.</span>
          </h1>
          <p>
            Welcome back, {state.profile.name}. Your next small step starts
            here.
          </p>
        </div>
        <Link href="/market" className="primary">
          <Plus size={17} />
          Make a trade
        </Link>
      </div>
      <div className="beginner-banner">
        <span className="banner-icon">
          <ShieldCheck size={22} />
        </span>
        <div>
          <strong>Your money is virtual. Your learning is real.</strong>
          <p>
            You have $10,000 in practice money to explore, make mistakes, and
            build confidence.
          </p>
        </div>
        <span className="badge">PRACTICE ACCOUNT</span>
      </div>
      <div className="stat-grid">
        <section className="card stat featured">
          <span>
            Portfolio value <Wallet size={16} />
          </span>
          <h2>{money(p.value)}</h2>
          <small>Your cash + the value of your stocks</small>
        </section>
        <section className="card stat">
          <span>
            Today’s gain / loss <TrendingUp size={16} />
          </span>
          <h2>
            <Delta value={p.today} />
          </h2>
          <small>Based on simulated daily prices</small>
        </section>
        <section className="card stat">
          <span>
            Available cash <span className="currency-icon">$</span>
          </span>
          <h2>{money(state.cash)}</h2>
          <small>Ready for your next practice trade</small>
        </section>
        <section className="card stat">
          <span>
            Total return <ChartNoAxesCombined size={16} />
          </span>
          <h2>
            <Delta value={p.gain} />
          </h2>
          <small>
            <Delta value={p.percent} percent /> since you started
          </small>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="card portfolio-card">
          <div className="card-heading">
            <div>
              <h2>Your portfolio, at a glance</h2>
              <p>Every journey starts somewhere.</p>
            </div>
            <span className="chart-key">
              <span /> Portfolio value
            </span>
          </div>
          <div className="chart-value">
            {money(p.value)} <span className="badge">ALL TIME</span>
          </div>
          <Chart
            data={
              state.snapshots.length > 1
                ? state.snapshots.map((s) => ({ date: s.date, price: s.value }))
                : [
                    { date: "Starting balance", price: 10000 },
                    { date: "Now", price: 10000 },
                  ]
            }
          />
          <div className="portfolio-footer">
            <span>
              <i className="legend-dot" />
              Cash <strong>{money(state.cash)}</strong>
            </span>
            <span>
              <i className="legend-dot invested" />
              Invested <strong>{money(p.invested)}</strong>
            </span>
            <Link href="/portfolio" className="text-link">
              View portfolio <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
        <section className="card learning-card">
          <div className="card-heading">
            <h2>Invest in your knowledge</h2>
            <span className="soft-icon">
              <GraduationCap size={22} />
            </span>
          </div>
          <p>The best first investment is in yourself.</p>
          <div className="learning-level">
            <span className="eyebrow">
              LEVEL {nextLesson.level} ·{" "}
              {levels[nextLesson.level - 1].toUpperCase()}
            </span>
            <strong>{nextLesson.title}</strong>
            <span className="small">
              3-minute lesson · clear examples · one quick quiz
            </span>
          </div>
          <div className="progress-label">
            <span>Your learning progress</span>
            <strong>{state.learning.completed.length}/25</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <Link href="/learn" className="primary full">
            Continue Learning <ArrowRight size={16} />
          </Link>
          <div className="learning-foot">
            <span>
              <Flame size={16} /> {state.learning.streak} day streak
            </span>
            <span>✦ {state.learning.xp} XP earned</span>
          </div>
        </section>
        <section className="card">
          <div className="card-heading">
            <h2>Your watchlist</h2>
            <Link href="/market" className="text-link">
              Explore market <ArrowUpRight size={15} />
            </Link>
          </div>
          <p className="card-subtitle">
            A few companies to get to know. Simulated prices.
          </p>
          {state.watchlist.length ? (
            <StockRows state={state} tickers={state.watchlist} />
          ) : (
            <Empty
              title="Your watchlist is open"
              text="Save a stock from its detail page."
              href="/market"
              label="Explore stocks"
            />
          )}
        </section>
        <section className="card">
          <div className="card-heading">
            <h2>Recent activity</h2>
            <Link href="/history" className="text-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          {state.trades.length ? (
            <div className="activity-list">
              {state.trades.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrade(t)}
                  className="activity"
                >
                  <span className="activity-icon">
                    <ArrowUpRight size={19} />
                  </span>
                  <span>
                    <strong>
                      {t.side === "buy" ? "Bought" : "Sold"} {t.ticker}
                    </strong>
                    <small>
                      {t.shares} shares ·{" "}
                      {new Date(t.date).toLocaleDateString()}
                    </small>
                  </span>
                  <b>{money(t.total)}</b>
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title="Your first trade is a fresh start."
              text="Practice a small trade and see exactly how it works."
              href="/market/AAPL"
              label="Explore your first trade"
            />
          )}
          {!state.trades.length && (
            <button className="secondary full" onClick={firstTrade}>
              Guide me through my first trade <ArrowRight size={16} />
            </button>
          )}
        </section>
      </div>
      <section className="market-overview">
        <div>
          <span className="eyebrow">THE BIGGER PICTURE</span>
          <h2>A snapshot of the market</h2>
          <p>Seeded market examples. No live market connection.</p>
        </div>
        {[
          { name: "S&P 500", price: "5,842.10", delta: 0.56 },
          { name: "NASDAQ", price: "18,421.09", delta: 1.12 },
          { name: "Dow Jones", price: "43,218.70", delta: -0.23 },
        ].map((m) => (
          <div key={m.name}>
            <span>{m.name}</span>
            <strong>{m.price}</strong>
            <Delta value={m.delta} percent />
          </div>
        ))}
      </section>
    </>
  );
}
