"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sprout,
  LayoutDashboard,
  BookOpen,
  ChartNoAxesCombined,
  Wallet,
  History,
  Trophy,
  Settings,
  UserRound,
  ArrowRight,
  Flame,
  ShieldCheck,
  ChevronRight,
  Menu,
  Check,
} from "lucide-react";
import type { State, Trade, Experience } from "@/types";
import { stocks, quote } from "@/lib/market";
import {
  initialState,
  portfolio,
  advanceMarket,
  resetSimulator,
  resetLearning,
} from "@/lib/trading";
import { useAccount } from "@/lib/storage/useAccount";
import { lessons, achievements, earned } from "@/lib/education";
import Logo from "./ui/Logo";
import AuthPanel from "./AuthPanel";
import Landing from "./screens/Landing";
import Market from "./screens/Market";
import StockDetail from "./screens/StockDetail";
import Achievements from "./screens/Achievements";
import Preferences from "./screens/Preferences";
import Dashboard from "./screens/Dashboard";
import Portfolio from "./screens/Portfolio";
import TradeHistory from "./screens/TradeHistory";

import { Empty } from "./ui/MarketUI";
import Dialog from "./Dialog";
import Learning from "./Learning";
import { ExplainTrade } from "./Trading";
const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/market", label: "Market", icon: ChartNoAxesCombined },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/history", label: "Trade History", icon: History },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];
export default function Simulator() {
  const { state, update: persist, error, user, pending, retry } = useAccount();
  const searchParams = useSearchParams();
  const path = usePathname(),
    router = useRouter();
  const [onboarding, setOnboarding] = useState(false),
    [experience, setExperience] = useState<Experience>("new"),
    [trade, setTrade] = useState<Trade | null>(null),
    [tradeQueue, setTradeQueue] = useState<Trade[]>([]),
    [reset, setReset] = useState<"simulator" | "learning" | null>(null),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false),
    [welcome, setWelcome] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function update(next: State) {
    const unlocked = state
      ? achievements.filter((a) => !earned(state, a.id) && earned(next, a.id))
      : [];
    if (pending) return;
    const saved = await persist(next);
    if (!saved) {
      setTrade(null);
      setTradeQueue([]);
      setToast("Changes were not saved. Please check the error message.");
      return;
    }
    if (unlocked.length)
      setToast(`${unlocked.map((a) => a.title).join(" · ")} unlocked!`);
  }
  if (!state)
    return (
      <main className="loading">
        <Logo />
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              className="primary"
              onClick={() => (user ? retry() : update(initialState()))}
            >
              {user ? "Retry loading account" : "Reset local account"}
            </button>
            <AuthPanel user={user} pending={pending} />
          </>
        ) : (
          <>
            <div className="skeleton" />
            <p>Preparing your practice space…</p>
          </>
        )}
      </main>
    );
  const guided =
    searchParams.get("guided") === "1" && state.trades.length === 0;
  const p = portfolio(state);
  const ticker = path.split("/")[2];
  const stock = ticker ? stocks.find((s) => s.ticker === ticker) : null;
  const current = stock ? quote(stock.ticker, state.tick) : null;
  const page = path.split("/")[1] || "dashboard";
  const progress = (state.learning.completed.length / lessons.length) * 100;
  const recommendedStart =
    state.profile.experience === "experienced"
      ? 21
      : state.profile.experience === "basics"
        ? 11
        : 1;
  const nextLesson =
    lessons.find(
      (l) =>
        l.id >= recommendedStart && !state.learning.completed.includes(l.id),
    ) ||
    lessons.find((l) => !state.learning.completed.includes(l.id)) ||
    lessons[0];
  function firstTrade() {
    router.push("/market/AAPL?guided=1");
  }
  function onTrade(t: Trade) {
    setTrade(t);
    setToast(
      state!.trades.length === 0
        ? "First Trade unlocked · +50 XP!"
        : "Practice trade completed",
    );
  }
  function onboard() {
    update({
      ...state!,
      profile: {
        ...state!.profile,
        onboarded: true,
        experience,
        beginner: experience === "new",
      },
    });
    setOnboarding(false);
    setWelcome(true);
    router.push("/");
  }
  function watch(t: string) {
    update({
      ...state!,
      watchlist: state!.watchlist.includes(t)
        ? state!.watchlist.filter((x) => x !== t)
        : [...state!.watchlist, t],
    });
  }
  function advance() {
    const result = advanceMarket(state!);
    update(result.state);
    if (result.filled.length) {
      setTrade(result.filled[0]);
      setTradeQueue(result.filled.slice(1));
    }
    setToast(
      result.filled.length
        ? `${result.filled.length} limit order(s) filled`
        : "Simulated prices updated",
    );
  }
  if (!state.profile.onboarded)
    return (
      <>
        <div className="landing-auth">
          <AuthPanel user={user} pending={pending} />
        </div>
        <Landing
          state={state}
          update={update}
          onboarding={onboarding}
          setOnboarding={setOnboarding}
          experience={experience}
          setExperience={setExperience}
          onboard={onboard}
        />
        {pending && (
          <div className="sync-overlay" role="status">
            Saving your progress…
          </div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Link href="/" aria-label="Sprout dashboard">
          <Logo />
        </Link>
        <span className="workspace-label">YOUR PRACTICE SPACE</span>
        <nav id="workspace-navigation">
          {navigation.map((n) => (
            <Link
              onClick={() => setMobile(false)}
              href={n.href}
              key={n.href}
              className={
                (n.href === "/" ? path === "/" : path.startsWith(n.href))
                  ? "active"
                  : ""
              }
            >
              <n.icon size={19} />
              {n.label}
              {n.label === "Learn" && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-course">
          <span className="course-icon">
            <Sprout size={21} />
          </span>
          <strong>Grow at your own pace.</strong>
          <p>
            One small lesson today.
            <br />A little more confidence tomorrow.
          </p>
          <Link href="/learn">
            Keep learning <ArrowRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <Link href="/profile">
            <UserRound size={19} />
            Profile
          </Link>
          <Link href="/settings">
            <Settings size={19} />
            Settings
          </Link>
          <div className="sidebar-disclaimer">
            <ShieldCheck size={15} />
            <span>
              Educational simulation
              <br />
              No real money involved
            </span>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Your workspace</span>
            <ChevronRight size={13} />
            <strong>
              {stock
                ? stock.company
                : page === "dashboard"
                  ? "Dashboard"
                  : page === "history"
                    ? "Trade History"
                    : page.charAt(0).toUpperCase() + page.slice(1)}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span className="live-dot" />{" "}
              {user ? "Cloud account" : "Demo mode"}
            </span>
            <span className="streak">
              <Flame size={17} />
              {state.learning.streak} day streak
            </span>
            <Link href="/profile" className="avatar" aria-label="Open profile">
              {state.profile.name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <main className="content">
          <AuthPanel user={user} pending={pending} />
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {page === "dashboard" && (
            <Dashboard
              state={state}
              p={p}
              nextLesson={nextLesson}
              progress={progress}
              setTrade={setTrade}
              firstTrade={firstTrade}
            />
          )}
          {page === "learn" && (
            <Learning state={state} update={update} firstTrade={firstTrade} />
          )}
          {page === "market" && !ticker && (
            <Market state={state} advance={advance} />
          )}
          {page === "market" && ticker && current && (
            <StockDetail
              state={state}
              ticker={ticker}
              current={current}
              advance={advance}
              watch={watch}
              update={update}
              onTrade={onTrade}
              guided={guided}
            />
          )}
          {page === "market" && ticker && !current && (
            <Empty
              title="Stock not found"
              text="This simulator supports ten seeded stocks and funds."
              href="/market"
              label="Return to market"
            />
          )}
          {page === "portfolio" && <Portfolio state={state} p={p} />}
          {page === "history" && (
            <TradeHistory
              state={state}
              update={update}
              setTrade={setTrade}
              advance={advance}
            />
          )}
          {page === "achievements" && <Achievements state={state} />}
          {(page === "settings" || page === "profile") && (
            <Preferences
              state={state}
              page={page}
              update={update}
              setReset={setReset}
            />
          )}
          {![
            "dashboard",
            "learn",
            "market",
            "portfolio",
            "history",
            "achievements",
            "profile",
            "settings",
          ].includes(page) && (
            <Empty
              title="This page has not sprouted yet."
              text="Head back to your practice space."
              href="/"
              label="Go to dashboard"
            />
          )}
          <footer className="app-footer">
            <span>
              <ShieldCheck size={14} /> Educational simulation only. This
              platform does not provide financial advice and does not use real
              money.
            </span>
            <span>
              Built for your next small step <Sprout size={14} />
            </span>
          </footer>
        </main>
      </div>
      {pending && (
        <div className="sync-overlay" role="status">
          Saving your progress…
        </div>
      )}
      {trade && (
        <ExplainTrade
          trade={trade}
          onClose={() => {
            if (tradeQueue.length) {
              setTrade(tradeQueue[0]);
              setTradeQueue(tradeQueue.slice(1));
            } else setTrade(null);
          }}
        />
      )}
      {welcome && (
        <Dialog
          title="Welcome to your next chapter."
          onClose={() => setWelcome(false)}
        >
          <div className="celebrate">
            <Sprout size={34} />
          </div>
          <p>
            {experience === "new"
              ? "Welcome! We’ll teach you trading from zero. No confusing Wall Street language."
              : "Your practice space is ready. Explore lessons at your level and trade with virtual money."}
          </p>
          <div className="tip">
            You start with $10,000.00. This is simulated money. No real money is
            being used.
          </div>
          <button
            className="primary full"
            onClick={() => {
              setWelcome(false);
              router.push("/learn");
            }}
          >
            Start with a lesson <ArrowRight size={16} />
          </button>
        </Dialog>
      )}
      {reset && (
        <Dialog
          title={`Reset ${reset === "simulator" ? "your simulator" : "learning progress"}?`}
          onClose={() => setReset(null)}
        >
          <p>
            This removes your{" "}
            {reset === "simulator"
              ? "holdings, trades, and orders and restores $10,000 in cash"
              : "completed lessons, quiz attempts, XP, and streak"}{" "}
            {user ? "in your cloud account" : "in this browser"}. This cannot be
            undone.
          </p>
          <button
            className="primary full"
            onClick={() => {
              update(
                reset === "simulator"
                  ? resetSimulator(state)
                  : resetLearning(state),
              );
              setReset(null);
              setToast("Your fresh start is ready.");
            }}
          >
            Confirm reset
          </button>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
