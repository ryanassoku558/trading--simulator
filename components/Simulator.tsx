"use client";
import {canEarnAchievement} from "@/lib/billing/achievements";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
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
  Search,
  Calculator,
} from "lucide-react";
import type { State, Trade, Experience } from "@/types";
import { useMarketClock } from "@/lib/market/useMarketClock";
import { stocks, quote } from "@/lib/market";
import {
  initialState,
  portfolio,
  advanceMarket,
  resetLearning,
} from "@/lib/trading";
import { useAccount } from "@/lib/storage/useAccount";
import {
  lessons,
  achievements,
  earned,
  beginnerLearningOrder,
} from "@/lib/education";
import ActivityTracker from "./ActivityTracker";
import LoadingBrand from "./ui/LoadingBrand";
import Logo from "./ui/Logo";
import AuthPanel from "./AuthPanel";
import ThemeToggle from "./ThemeToggle";
import MarketTicker from "./MarketTicker";
import Landing from "./screens/Landing";
import Market from "./screens/Market";
import StockDetail from "./screens/StockDetail";
import Achievements from "./screens/Achievements";
import Preferences from "./screens/Preferences";
import Dashboard from "./screens/Dashboard";
import Portfolio from "./screens/Portfolio";
import Community from "./screens/Community";
import ReferralCard from "./ReferralCard";
import {Pricing,ProGate,SimulatorMoney,useSubscription,billingRequest} from "./Subscription";
import {canLearn} from "@/lib/billing/access";
import VisualTools from "./VisualTools";
import {PsychologyVisuals} from "./PracticeVisuals";
import About from "./screens/About";
import Policies,{policyPages,PolicyLinks} from "./screens/Policies";
import Practice from "./screens/Practice";
import TradeHistory from "./screens/TradeHistory";

import { Empty } from "./ui/MarketUI";
import Dialog from "./Dialog";
import Learning from "./Learning";
import { ExplainTrade } from "./Trading";
const navigation = [
  { href: "/about", label: "About Sprout", icon: Sprout, group:"Overview" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: BookOpen, group:"Learn & practice" },
  { href: "/practice", label: "Practice Lab", icon: ChartNoAxesCombined },
  { href: "/tools", label: "Tools", icon: Calculator },
  { href: "/market", label: "Simulator", icon: ChartNoAxesCombined, group:"Trading workspace" },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/history", label: "Trade History", icon: History },
  { href: "/community", label: "Community", icon: UserRound, group:"Community & rewards" },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/pricing", label: "Sprout Pro", icon: Trophy },
];
export default function Simulator() {
  const { state: savedState, update: persist, error, user, pending, retry } = useAccount();
  const subscription=useSubscription();
  const liveTick = useMarketClock();
  const [marketPace,setMarketPace]=useState<{base:number;started:number;fast:boolean}|null>(null);
  const effectiveTick=marketPace?marketPace.base+Math.max(0,liveTick-marketPace.started)*(marketPace.fast&&subscription.pro?4:1):liveTick;
  const state = savedState ? {...savedState, tick: Math.max(savedState.tick, effectiveTick)} : null;
  useEffect(() => {
    if (!savedState || pending || error || effectiveTick <= savedState.tick || !savedState.orders.some(o => o.status === "pending")) return;
    const result = advanceMarket(savedState, effectiveTick);
    if (result.state.orders.some((o, i) => o.status !== savedState.orders[i].status)) void persist(result.state);
  }, [savedState, effectiveTick, pending, error, persist]);
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
    [welcome, setWelcome] = useState(false),
    [marketSearch, setMarketSearch] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function update(next: State) {
    const unlocked = state
      ? achievements.filter((a) => canEarnAchievement(a.id,subscription.pro) && !earned(state, a.id) && earned(next, a.id))
      : [];
    if (pending) return false;
    const saved = await persist(next);
    if (!saved) {
      setTrade(null);
      setTradeQueue([]);
      setToast("Changes were not saved. Please check the error message.");
      return false;
    }
    if (unlocked.length && next.profile.achievementNotifications !== false)
      setToast(`${unlocked.map((a) => a.title).join(" · ")} unlocked!`);
    return true;
  }
  if (!state && !error)
    return <main className="sprout-loading" aria-label="Loading your practice space"><LoadingBrand /></main>;
  if (!state)
    return (
      <main className="loading">
        <Logo />
        <p role="alert">{error}</p>
        <button className="primary" onClick={() => (user ? retry() : update(initialState()))}>
          {user ? "Retry loading account" : "Reset local account"}
        </button>
        <AuthPanel user={user} pending={pending} />
      </main>
    );
  const guided =
    searchParams.get("guided") === "1" && state.trades.length === 0;
  const p = portfolio(state);
  const ticker = path.split("/")[2];
  const stock = ticker ? stocks.find((s) => s.ticker === ticker) : null;
  const current = stock ? quote(stock.ticker, state.tick) : null;
  const page = path.split("/")[1] || "about";
  const accessibleLessons=lessons.filter(l=>canLearn(l.id,subscription.pro));
  const progress = (state.learning.completed.filter(id=>canLearn(id,subscription.pro)).length / accessibleLessons.length) * 100;
  const recommendedStart =
    state.profile.experience === "experienced"
      ? 21
      : state.profile.experience === "basics"
        ? 11
        : 1;
  const beginnerNext =
    state.profile.experience === "new"
      ? lessons.find(
          (l) =>
            l.id ===
            beginnerLearningOrder.find(
              (id) => !state.learning.completed.includes(id),
            ),
        )
      : null;
  const nextLesson =
    beginnerNext ||
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
        ? subscription.pro ? "First Trade unlocked · +50 XP!" : "Your first practice trade is complete."
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
    router.push("/dashboard");
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
  if (!state.profile.onboarded && page === "pricing") return <main className="content"><Link href="/" className="text-link">← Back to Sprout</Link><Pricing/>{!user&&<div id="account"><AuthPanel user={user} pending={pending}/></div>}</main>;
  if (!state.profile.onboarded && page === "welcome")
    return (
      <>
        <Landing
          state={state}
          update={update}
          onboarding={onboarding}
          setOnboarding={setOnboarding}
          experience={experience}
          setExperience={setExperience}
          onboard={onboard}
          accountPanel={user?null:<AuthPanel user={user} pending={pending} />}
        />
        {pending && (
          <div className="sync-overlay"><LoadingBrand compact message="Saving your progress…" /></div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Link href="/" aria-label="Sprout home">
          <Logo />
        </Link>
        <span className="workspace-label">YOUR SPROUT WORKSPACE</span>
        <nav id="workspace-navigation">
          {navigation.map((n) => (
            <Fragment key={n.href}>{n.group&&<span className="nav-group-label">{n.group}</span>}<Link
              onClick={() => setMobile(false)}
              href={n.href}
              key={n.href}
              className={
                ((n.href === "/about" && path === "/") || path.startsWith(n.href))
                  ? "active"
                  : ""
              }
            >
              <n.icon size={19} />
              {n.label}
              {n.label === "Learn" && <span className="nav-dot" />}
            </Link></Fragment>
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
          <span className="nav-group-label">Account</span>
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
          <form
            className="global-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(
                `/market?q=${encodeURIComponent(marketSearch.trim())}`,
              );
            }}
          >
            <Search size={16} />
            <input
              aria-label="Search the market"
              placeholder="Search stocks & funds"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
            />
            <button type="submit" aria-label="Submit market search">
              <ArrowRight size={15} />
            </button>
          </form>
          <div className="topbar-right">
            <button className="pro-pill" onClick={()=>subscription.upgrade("The full Sprout toolkit")}>{subscription.pro?"Sprout Pro":"Explore Pro"}</button>
            <ThemeToggle />
            <span className="demo-badge">
              <span className="live-dot" />{" "}
              {user ? "Cloud account" : "Demo mode"}
            </span>
            <a href="#account" className="account-link">
              {user ? "Account" : "Sign in"}
            </a>
            <span className="streak">
              <Flame size={17} />
              {state.learning.streak} day streak
            </span>
            <Link href="/profile" className="avatar" aria-label="Open profile">
              {state.profile.photo?<Image unoptimized src={state.profile.photo} width={40} height={40} alt="Your profile photo"/>:state.profile.name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <ActivityTracker accountId={state.profile.id} page={page}/>
        {!(page==="market"&&!ticker)&&<MarketTicker tick={state.tick} />}
        <main className="content">
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {page === "pricing" && <Pricing/>}
          {page === "market" && <div className="simulator-mode-row"><span className="eyebrow">PRACTICE MODES</span><button className="secondary" aria-pressed={!!marketPace?.fast&&subscription.pro} onClick={()=>{if(!subscription.pro){subscription.upgrade("High-Volatility Mode");return;}setMarketPace({base:state.tick,started:liveTick,fast:!marketPace?.fast});}}>{marketPace?.fast&&subscription.pro?"High-volatility · 4× movement speed":"High-Volatility Mode"}</button><button className="secondary" onClick={()=>subscription.pro?router.push("/practice#chart-practice"):subscription.upgrade("Replay Mode")}>Replay Mode</button></div>}
          {page === "market" && <SimulatorMoney state={state} onReset={()=>setReset("simulator")} onRecharge={async()=>{await billingRequest("simulator",{action:"recharge"});retry();setToast("$5,000 virtual cash added.");}}/>}
          {page === "dashboard" && (
            <Dashboard
              state={state}
              p={p}
              nextLesson={canLearn(nextLesson.id,subscription.pro)?nextLesson:lessons.find(l=>canLearn(l.id,subscription.pro)&&!state.learning.completed.includes(l.id))||lessons[0]}
              progress={progress}
              setTrade={setTrade}
              firstTrade={firstTrade}
            />
          )}
          {page === "learn" && (
            <Learning key={`${subscription.pro}-${searchParams.get("lesson")||"curriculum"}`} state={state} update={update} firstTrade={firstTrade} />
          )}
          {page === "market" && !ticker && (
            <Market
              key={`${searchParams.get("q")||""}-${searchParams.get("symbol")||""}`}
              state={state}
              advance={advance}
              watch={watch}
              update={update}
              onTrade={onTrade}
            />
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
              text="Search the US stock and ETF catalog for an available symbol."
              href="/market"
              label="Return to market"
            />
          )}
          {page === "community" && <Community state={state} user={user}/>}
          {page === "tools" && <><div className="page-heading"><div><span className="eyebrow">PRACTICE WITH A PLAN</span><h1>Your trading tools</h1><p>Planning tools help you explore share size, potential losses, possible outcomes, and your mindset before a virtual trade. Open each guide to learn how it works.</p></div></div><VisualTools tick={state.tick}/><ProGate feature="Psychology insights"><PsychologyVisuals state={state} update={update}/></ProGate></>}
          {page === "about" && <About/>}
          {policyPages.includes(page)&&<Policies page={page}/>}
          {page === "practice" && <Practice state={state} update={update}/>}
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
              setReset={value=>{if(value==="simulator"&&!subscription.pro){subscription.upgrade("Unlimited simulator resets");return;}setReset(value);}}
            />
          )}
          {![
            ...policyPages,
            "pricing",
            "about",
            "dashboard",
            "learn",
            "market",
            "portfolio",
            "practice",
            "tools",
            "community",
            "history",
            "achievements",
            "profile",
            "settings",
          ].includes(page) && (
            <Empty
              title="This page has not sprouted yet."
              text="Head back to your practice space."
              href="/dashboard"
              label="Go to dashboard"
            />
          )}

          {page==="profile"&&<ReferralCard/>}
          {!user&&!policyPages.includes(page)&&<div id="account">
            <AuthPanel user={user} pending={pending} />
          </div>}
          <footer className="app-footer">
            <span>
              <ShieldCheck size={14} /> Educational simulation only. This
              platform does not provide financial advice and does not use real
              money.
            </span>
            <span>
              Built for your next small step <Sprout size={14} />
            </span>
            <PolicyLinks/>
          </footer>
        </main>
      </div>
      {pending && (
        <div className="sync-overlay"><LoadingBrand compact message="Saving your progress…" /></div>
      )}
      {trade && (
        <ExplainTrade
          trade={trade}
          completed={state.learning.completed.length}
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
            onClick={async () => {
              if(reset === "simulator" && !subscription.pro){setReset(null);subscription.upgrade("Unlimited simulator resets");return;}
              try {if(reset === "simulator"){await billingRequest("simulator",{action:"reset"});retry();}else await update(resetLearning(state));setReset(null);setToast("Your fresh start is ready.");}catch(e){setToast(e instanceof Error?e.message:"Unable to reset.");}
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
