"use client";
import { useRouter } from "next/navigation";
import type { State, Experience } from "@/types";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Lightbulb,
  TrendingUp,
  GraduationCap,
  Check,
} from "lucide-react";
import Chart from "../Chart";
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
}: {
  state: State;
  update: (s: State) => void;
  onboarding: boolean;
  setOnboarding: (v: boolean) => void;
  experience: Experience;
  setExperience: (v: Experience) => void;
  onboard: () => void;
}) {
  const router = useRouter();
  return (
    <main className="landing">
      <header className="landing-nav">
        <Logo />
        <span className="badge">
          <ShieldCheck size={15} />
          100% virtual. 100% yours to explore.
        </span>
        <button className="text-link" onClick={() => setOnboarding(true)}>
          Get started <ArrowUpRight size={16} />
        </button>
      </header>
      <section className="landing-hero">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> BIG DREAMS START WITH SMALL STEPS
          </span>
          <h1>
            Learn trading.
            <br />
            Build confidence.
            <br />
            <em>Skip the risk.</em>
          </h1>
          <p>
            Learn the basics, practice with $10,000 in virtual cash, and
            understand every trade you make.
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
              Explore Demo <ArrowUpRight size={18} />
            </button>
          </div>
          <span className="small">
            No real money. No pressure. Just practice.
          </span>
        </div>
        <div className="landing-preview">
          <div className="card preview-account">
            <span className="eyebrow">YOUR PRACTICE PORTFOLIO</span>
            <h2>
              $10,000<span>.00</span>
            </h2>
            <p>
              <span className="positive">A fresh start</span> · unlimited
              possibilities
            </p>
            <Chart
              data={[
                { date: "Start", price: 10000 },
                { date: "Now", price: 10000 },
              ]}
            />
            <div className="preview-pill">
              <ShieldCheck size={20} />
              <span>
                Real lessons.
                <br />
                <strong>Virtual money.</strong>
              </span>
            </div>
          </div>
          <div className="floating-lesson">
            <span className="level-icon">
              <GraduationCap />
            </span>
            <div>
              <strong>Your first step starts here</strong>
              <small>What is a stock? · 3 min lesson</small>
            </div>
            <ArrowRight size={18} />
          </div>
        </div>
      </section>
      <div className="landing-features">
        {[
          {
            icon: BookOpen,
            title: "Learn the Basics",
            text: "Small lessons. Clear examples. Real confidence.",
          },
          {
            icon: ChartNoAxesCombined,
            title: "Practice Trading",
            text: "Make your first move with $10,000 in virtual cash.",
          },
          {
            icon: Lightbulb,
            title: "Understand Every Trade",
            text: "See what every price change means for you.",
          },
          {
            icon: TrendingUp,
            title: "Track Your Progress",
            text: "Watch your knowledge and your portfolio grow.",
          },
        ].map((f) => (
          <section key={f.title}>
            <f.icon />
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </section>
        ))}
      </div>
      <footer>
        Educational simulation only. This platform does not provide financial
        advice and does not use real money.
      </footer>
      {onboarding && (
        <Dialog
          title="Let’s find your starting point."
          onClose={() => setOnboarding(false)}
        >
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
