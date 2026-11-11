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
import { lessons, beginnerLearningOrder, achievements, earned } from "@/lib/education";
import { learningModules } from "@/lib/billing/curriculum";
import { canEarnAchievement } from "@/lib/billing/achievements";
import { starterLessonIds } from "@/lib/billing/access";
import { useSubscription } from "../Subscription";
import LearningPathSteps from "../LearningPathSteps";
import { LearningSignals } from "../LearningRetention";
import type { State } from "@/types";
export default function CompactDashboard({ state }: { state: State }) {
  const { pro } = useSubscription(),
    completed = new Set(state.learning.completed.filter(id=>lessons.some(l=>l.id===id))),
    ids = pro ? beginnerLearningOrder : starterLessonIds;
  const pathComplete = ids.every(id => completed.has(id));
  const earnedMilestones = achievements.filter(a => canEarnAchievement(a.id, pro) && earned(state, a.id));
  const nextMilestone = achievements.find(a => canEarnAchievement(a.id, pro) && !earned(state, a.id) && (pro || ["lesson", "trade", "five", "builder", "streak", "quiz"].includes(a.id)));
  const next =
    lessons.find(
      (l) => l.id === (ids.find((id) => !completed.has(id)) ?? ids[0]),
    ) || lessons[0];
  const currentModule =
    learningModules.find((m) => m.ids.includes(next.id)) || learningModules[0];
  const completeCount = currentModule.ids.filter((id) =>
    completed.has(id),
  ).length;
  const simulatorHref = state.trades.length === 0 ? "/market/AAPL?guided=1" : "/market";
  const quick = [
    { label: "Lessons", href: "/learn?view=Lessons&lesson=1", icon: BookOpen },
    { label: "Modules", href: "/learn?view=Modules", icon: Library },
    { label: "Glossary", href: "/learn?view=Glossary", icon: Search },
    { label: "Tools", href: "/tools", icon: Calculator },
    { label: "Simulator", href: simulatorHref, icon: ChartNoAxesCombined },
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
          New to trading? Start with one short lesson, try its five-question quiz,
          then practise with pretend money. No experience needed.
        </p>
        <div className="presentation-actions">
          <Link className="primary" href={`/learn?lesson=${next.id}`}>
            {pathComplete ? "Review Learning" : completed.size ? "Continue Learning" : "Start Learning"} <ArrowRight size={16} />
          </Link>
          <Link className="secondary" href={simulatorHref}>
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
          <p>{pathComplete ? "Your available learning path is complete. Review a lesson or keep practicing." : `Next recommended lesson · ${currentModule.title}`}</p>
          <nav className="home-module-steps" aria-label={`${currentModule.title} lesson steps`}>
            {currentModule.ids.map((id, index) => {
              const lesson = lessons.find(l => l.id === id)!;
              const done = completed.has(id);
              return <Link key={id} href={`/learn?lesson=${id}`} className={done ? "step-complete" : id === next.id ? "step-current" : ""} aria-current={!pathComplete && id === next.id ? "step" : undefined} aria-label={`${lesson.title}${done ? " — completed" : ""}`} title={lesson.title}>{done ? "✓" : index + 1}</Link>;
            })}
          </nav>
        </div>
        <div className="home-path-progress">
          <small>
            {completeCount}/{currentModule.ids.length} lessons in this module · {Math.round(completeCount / currentModule.ids.length * 100)}%
          </small>
          <progress
            value={completeCount}
            max={currentModule.ids.length}
            aria-label="Current module progress"
          />
          <small>
            {completed.size} / {lessons.length} lessons completed · {state.learning.xp} XP
          </small>
          <progress value={completed.size} max={lessons.length} aria-label="Course lessons completed" />
        </div>
        <Link className="secondary" href={`/learn?lesson=${next.id}`}>
          {pathComplete ? "Review" : completed.size ? "Resume" : "Begin lesson"} →
        </Link>
      </section>
      <LearningSignals state={state} />
      <div className="home-milestone-note" role="status">
        <Trophy size={16} aria-hidden="true"/>
        <span><strong>{earnedMilestones.length} milestone{earnedMilestones.length === 1 ? "" : "s"} earned</strong>{nextMilestone ? ` · Next: ${nextMilestone.title} — ${nextMilestone.description}` : " · Keep practicing and exploring your learning path."}</span>
        <Link href="/achievements" className="text-link">View rewards →</Link>
      </div>
      <div className="beginner-next-note"><strong>Not sure what to click?</strong> {completed.size===0 ? 'Choose Start Learning above. We’ll explain what a stock is, show an example, then guide you through five questions.' : state.trades.length===0 ? 'You’ve started learning. When you’re ready, Open Simulator lets you practise with pretend money—nothing is bought with real cash.' : 'Keep learning with Resume, revisit a tricky word in Glossary, or try a friendly practice game.'}</div>
      <div className="compact-section-heading">
        <h2>{completed.size ? "Your next steps" : "Start here"}</h2>
        <Link href="/learn?view=Tutorials" className="text-link">Watch a quick tour →</Link>
      </div>
      <LearningPathSteps state={state} />
      <div className="compact-section-heading">
        <h2>Practice & tools</h2>
      </div>
      <div className="home-practice">
        {[
          {
            title: "Play & study",
            text: "Solo quests, guided study cards, and live room-code quizzes.",
            href: "/play",
            action: "Choose a game",
          },
          {
            title: "Practice Lab",
            text: "Try focused chart scenarios.",
            href: "/practice",
            action: "Open lab",
          },
          {
            title: "Simulator",
            text: "Practice trades with virtual money.",
            href: simulatorHref,
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
