"use client";
import About from "./About";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { lessons } from "@/lib/education";
import { candles, quote, money, stocks } from "@/lib/market";
import CandlestickChart from "../CandlestickChart";
import type { State, Experience } from "@/types";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Lightbulb,
  TrendingUp,
  Check,
  Calculator, UserRound, Users,
} from "lucide-react";

import {LearningRoadmap,PatternPreview,StrategyCards} from "../VisualLearning";
import TradingBenefits from "../TradingBenefits";
import Sprouty from "../Sprouty";
import Link from "next/link";
import VisualTools from "../VisualTools";
import {DailySnapshot} from "../PracticeVisuals";
import LearnerReviews from "../LearnerReviews";
import TutorialLibrary from "../TutorialLibrary";
import ThemeToggle from "../ThemeToggle";
import MarketTicker from "../MarketTicker";
import {SproutMission, LearnerStories} from "../SproutMission";
import Dialog from "../Dialog";
import Logo from "../ui/Logo";
export default function Landing({
  state,
  update,
  onboarding,
  setOnboarding,
  experience,
  setExperience,
  onboard,
  accountPanel,
}: {
  accountPanel: ReactNode;
  state: State;
  update: (s: State) => void;
  onboarding: boolean;
  setOnboarding: (v: boolean) => void;
  experience: Experience;
  setExperience: (v: Experience) => void;
  onboard: () => void;
}) {
  const router = useRouter();
  const [previewTicker, setPreviewTicker] = useState("AAPL");
  const previewQuote = quote(previewTicker, state.tick);
  function enter(url:string){update({...state,profile:{...state.profile,onboarded:true}});router.push(url);}
  return (
    <main className="landing">
      <div className="landing-utility">
        <span>
          SPROUT TRADING <i /> EDUCATION & PAPER TRADING
        </span>
        <span>Simulated markets. Real understanding.</span>
      </div>
      <header className="landing-nav">
        <Logo />
        <nav aria-label="Website navigation">
          <a href="#roadmap"><BookOpen size={16}/> Learn</a>
          <button onClick={()=>enter('/market')}><ChartNoAxesCombined size={16}/> Simulator</button>
          <a href="#tools"><Calculator size={16}/> Tools</a>
          <button onClick={()=>enter('/community')}><Users size={16}/> Community</button>
          <a href="#about">About</a>
          <Link href="/pricing">Pricing</Link>
          <a href="#account"><UserRound size={16}/> Account</a>
        </nav>
        <ThemeToggle />
        <a className="secondary" href="#account">
          Sign in <ArrowUpRight size={15} />
        </a>
      </header>
      <MarketTicker tick={state.tick}/>
      <section className="landing-hero" id="platform">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> A BETTER START TO UNDERSTANDING
            MARKETS
          </span>
          <h1>
            Grow Your Trading Skills<br/><em>With Confidence</em>
          </h1>
          <p>
            A beginner-friendly platform built for real learning. Understand charts, practice decisions, and build financial confidence through clear explanations and $10,000 in virtual practice cash.
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={() => setOnboarding(true)}>
              Start Learning <ArrowRight size={18} />
            </button>
            <button
              className="secondary"
              onClick={() => {
                update({
                  ...state,
                  profile: { ...state.profile, onboarded: true },
                });
                router.push("/");
              }}
            >
              Try the Simulator <ArrowUpRight size={18} />
            </button>
          </div>
          <p className="starting-message">There’s no single amount everyone needs to start. The best time to begin learning is now—start with virtual practice, at your own pace.</p>
          <span className="hero-disclosure">
            <ShieldCheck size={16} /> Educational simulation. No real money
            required.
          </span>
          <Sprouty completed={state.learning.completed.length}/>
          <div className="hero-facts">
            <div>
              <strong>$10,000</strong>
              <span>Virtual starting balance</span>
            </div>
            <div>
              <strong>{lessons.length}</strong>
              <span>Lessons & quizzes</span>
            </div>
            <div>
              <strong>{stocks.length.toLocaleString()}</strong>
              <span>Stocks & funds to explore</span>
            </div>
          </div>
        </div>
        <div className="landing-preview">
          <div className="terminal-caption">
            <span>
              <span className="live-dot" /> YOUR MARKET WORKSPACE
            </span>
            <span>ILLUSTRATIVE DATA</span>
          </div>
          <div className="card preview-account">
            <div className="preview-summary">
              <div>
                <span className="eyebrow">PRACTICE ACCOUNT VALUE</span>
                <h2>
                  $10,000<span>.00</span>
                </h2>
              </div>
              <span className="badge">VIRTUAL CASH</span>
            </div>
            <div className="preview-stock">
              <div>
                <strong>{previewQuote.company}</strong>
                <span>{previewTicker} · Simulated quote</span>
              </div>
              <div>
                <strong>{money(previewQuote.price)}</strong>
                <span
                  className={previewQuote.change >= 0 ? "positive" : "negative"}
                >
                  {previewQuote.change >= 0 ? "+" : ""}
                  {previewQuote.change.toFixed(2)}%
                </span>
              </div>
            </div>
            <div
              className="preview-tabs"
              role="group"
              aria-label="Preview stock"
            >
              {["AAPL", "MSFT", "NVDA"].map((t) => (
                <button
                  key={t}
                  aria-pressed={previewTicker === t}
                  className={previewTicker === t ? "active" : ""}
                  onClick={() => setPreviewTicker(t)}
                >
                  {t}
                </button>
              ))}
              <span>LIVE · Candlesticks</span>
            </div>
            <CandlestickChart data={candles(previewTicker, "LIVE", state.tick)} />
            <div className="preview-bottom">
              <ShieldCheck size={15} />
              <span>Practice every decision. Understand every trade.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="capabilities" id="education">
        <div className="section-intro">
          <span className="eyebrow">BUILT FOR YOUR NEXT STEP</span>
          <h2>
            The tools to learn.
            <br />
            The space to practice.
          </h2>
          <p>
            From your first share to your first candlestick pattern, put
            knowledge into action.
          </p>
        </div>
        <div className="landing-features">
          {[
            {
              icon: BookOpen,
              title: "Learn the Basics",
              text: `${lessons.length} focused lessons, clear examples, and knowledge checks. Progress at your own pace.`,
            },
            {
              icon: ChartNoAxesCombined,
              title: "Read the market",
              text: "Explore line and candlestick charts across five timeframes with simulated prices.",
            },
            {
              icon: Lightbulb,
              title: "Understand Every Trade",
              text: "See position size, potential outcomes, and the impact of each practice decision.",
            },
            {
              icon: TrendingUp,
              title: "Track Your Progress",
              text: "Review your holdings, allocation, returns, and learning progress in one workspace.",
            },
          ].map((f, index) => (
            <section key={f.title}>
              <div className="feature-index">
                <f.icon size={24} />
                <span>0{index + 1}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </section>
          ))}
        </div>
      </section>
      <section className="getting-started" id="how-it-works">
        <div>
          <span className="eyebrow">A SIMPLE PATH FORWARD</span>
          <h2>
            Make your next move
            <br />
            an informed one.
          </h2>
          <button className="primary" onClick={() => setOnboarding(true)}>
            Get started <ArrowRight size={16} />
          </button>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Find your starting point</h3>
              <p>
                Choose your experience level. Every lesson remains open to you.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Build a practice portfolio</h3>
              <p>
                Buy and sell with virtual cash. Explore charts and review your
                decisions.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Keep your progress</h3>
              <p>
                Create a Sprout account to save your learning and practice
                portfolio across devices.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <PatternPreview onNavigate={enter}/>
      <LearningRoadmap state={state} onNavigate={enter}/>
      <StrategyCards onNavigate={enter}/>
      <VisualTools tick={state.tick}/>
      <DailySnapshot tick={state.tick}/>
      <TutorialLibrary />
      <About embedded/>
      <SproutMission />
      <TradingBenefits onNavigate={enter}/>
      <LearnerStories />
      <LearnerReviews/>
      <Link className="secondary" href="/pricing">Explore Sprout Pro · $10/month</Link>
      <div id="account" className="landing-account">
        {accountPanel}
      </div>
      <footer className="corporate-footer">
        <div>
          <Logo />
          <p>Market knowledge for your next chapter.</p>
        </div>
        <div className="footer-links">
          <a href="#roadmap"><BookOpen size={16}/> Learn</a>
          <button onClick={()=>enter('/market')}><ChartNoAxesCombined size={16}/> Simulator</button>
          <a href="#tools"><Calculator size={16}/> Tools</a>
          <button onClick={()=>enter('/community')}><Users size={16}/> Community</button>
          <a href="#about">About</a>
          <Link href="/pricing">Pricing</Link>
          <a href="#account"><UserRound size={16}/> Account</a>
          <a href="#account">Account</a>
        </div>
        <div className="footer-disclosure">
          <strong>Practice with perspective.</strong>
          <p>
            Sprout is an educational paper-trading simulator. All prices and
            market examples are simulated. No real money or securities are
            traded. This platform does not provide investment advice or promise
            future returns.
          </p>
          <span>© {new Date().getFullYear()} Sprout Trading</span>
        </div>
      </footer>
      {onboarding && (
        <Dialog
          title="Let’s find your starting point."
          onClose={() => setOnboarding(false)}
        >
          <Sprouty compact completed={state.learning.completed.length} message="We’ll start with what you know and build from there. Every lesson stays open to you."/>
          <p>How much do you know about trading?</p>
          <div className="onboarding-options">
            {(
              [
                {
                  id: "new",
                  label: "Nothing — I’m completely new",
                  text: "Start with the basics. We’ll guide every step.",
                },
                {
                  id: "basics",
                  label: "I know the basics",
                  text: "Build on what you know and practice placing trades.",
                },
                {
                  id: "experienced",
                  label: "I’ve traded before",
                  text: "Explore portfolio lessons and practice your approach.",
                },
              ] as { id: Experience; label: string; text: string }[]
            ).map((o) => (
              <button
                className={experience === o.id ? "chosen" : ""}
                key={o.id}
                onClick={() => setExperience(o.id)}
              >
                <span className="radio">
                  {experience === o.id && <Check size={14} />}
                </span>
                <span>
                  <strong>{o.label}</strong>
                  <small>{o.text}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="tip">
            Your account starts with $10,000.00 in virtual cash. This is
            simulated money. No real money is being used.
          </div>
          <button className="primary full" onClick={onboard}>
            Create my practice space <ArrowRight size={17} />
          </button>
        </Dialog>
      )}
    </main>
  );
}
