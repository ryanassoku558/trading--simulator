"use client";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Library,
  Search,
  Calculator,
  ChartNoAxesCombined,
  Trophy,
} from "lucide-react";
import { lessons, beginnerLearningOrder } from "@/lib/education";
import { learningModules } from "@/lib/billing/curriculum";
import { starterLessonIds } from "@/lib/billing/access";
import { useSubscription } from "../Subscription";
import LearningPathSteps from "../LearningPathSteps";
import { LearningSignals } from "../LearningRetention";
import type { State } from "@/types";
export default function CompactDashboard({ state }: { state: State }) {
  const { pro } = useSubscription(),
    completed = new Set(state.learning.completed),
    ids = pro ? beginnerLearningOrder : starterLessonIds;
  const next =
    lessons.find(
      (l) => l.id === (ids.find((id) => !completed.has(id)) ?? ids[0]),
    ) || lessons[0];
  const currentModule =
    learningModules.find((m) => m.ids.includes(next.id)) || learningModules[0];
  const completeCount = currentModule.ids.filter((id) =>
    completed.has(id),
  ).length;
  const quick = [
    { label: "Lessons", href: "/learn?view=Lessons", icon: BookOpen },
    { label: "Modules", href: "/learn?view=Modules", icon: Library },
    { label: "Glossary", href: "/learn?view=Glossary", icon: Search },
    { label: "Tools", href: "/tools", icon: Calculator },
    { label: "Simulator", href: "/market", icon: ChartNoAxesCombined },
    { label: "Progress", href: "/achievements", icon: Trophy },
  ];
  return (
    <div className="compact-learning compact-home">
      <section className="compact-home-hero">
        <span className="eyebrow">
          {state.profile.name === "Guest"
            ? "SMALL STEPS. LASTING UNDERSTANDING."
            : `WELCOME BACK, ${state.profile.name}`}
        </span>
        <h1>Learn Trading the Simple Way.</h1>
        <p>
          Beginner-friendly lessons, hands-on practice, and a guided path to
          financial confidence.
        </p>
        <div className="presentation-actions">
          <Link className="primary" href={`/learn?lesson=${next.id}`}>
            Start Learning <ArrowRight size={16} />
          </Link>
          <Link className="secondary" href="/market">
            Open Simulator
          </Link>
        </div>
        <span className="home-leaf" aria-hidden="true">
          🌱
        </span>
      </section>
      <nav className="home-quick" aria-label="Quick access">
        {quick.map((x) => (
          <Link className="card" key={x.label} href={x.href}>
            <x.icon size={18} />
            <strong>{x.label}</strong>
          </Link>
        ))}
      </nav>
      <section className="card home-path">
        <div>
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>{next.title}</h2>
          <p>Next recommended lesson · {currentModule.title}</p>
        </div>
        <div className="home-path-progress">
          <small>
            {completeCount}/{currentModule.ids.length} lessons in this module
          </small>
          <progress
            value={completeCount}
            max={currentModule.ids.length}
            aria-label="Current module progress"
          />
          <small>
            {completed.size} lessons completed · {state.learning.xp} XP
          </small>
        </div>
        <Link className="secondary" href={`/learn?lesson=${next.id}`}>
          {completed.size ? "Resume" : "Begin lesson"} →
        </Link>
      </section>
      <LearningSignals state={state} />
      <div className="compact-section-heading">
        <h2>{completed.size ? "Your next steps" : "Start here"}</h2>
        <span className="small">Four steps, at your pace</span>
      </div>
      <LearningPathSteps state={state} />
      <div className="compact-section-heading">
        <h2>Practice & tools</h2>
      </div>
      <div className="home-practice">
        {[
          {
            title: "Practice Lab",
            text: "Try focused chart scenarios.",
            href: "/practice",
            action: "Open lab",
          },
          {
            title: "Simulator",
            text: "Practice trades with virtual money.",
            href: "/market",
            action: "Practice trading",
          },
        ].map((x) => (
          <article className="card" key={x.title}>
            <div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
            <Link href={x.href}>{x.action} →</Link>
          </article>
        ))}
      </div>
      <section className="home-why" aria-label="Why Sprout works">
        {[
          { title: "Simple", text: "Trading explained in plain language." },
          {
            title: "Guided",
            text: "Step-by-step lessons built for beginners.",
          },
          {
            title: "Hands-On",
            text: "Practice in a safe, simulated environment.",
          },
        ].map((x) => (
          <div key={x.title}>
            <strong>{x.title}</strong>
            <small>{x.text}</small>
          </div>
        ))}
      </section>
    </div>
  );
}
