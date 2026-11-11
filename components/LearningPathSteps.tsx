import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { State } from "@/types";
import { starterModules } from "@/lib/billing/access";
export default function LearningPathSteps({ state }: { state: State }) {
  const steps = [
    {
      title: "Learn the basics",
      help: "Read your first short lesson. No prior knowledge needed.",
      href: "/learn?lesson=1",
      done: state.learning.completed.includes(1),
    },
    {
      title: "Complete Module 1",
      help: "Take five questions, then follow the next-module prompt.",
      href: "/learn?view=Modules",
      done: starterModules[0].ids.every((id) =>
        state.learning.completed.includes(id),
      ),
    },
    {
      title: "Try a practice trade",
      help: "Buy one virtual share with pretend money.",
      href: "/market/AAPL?guided=1",
      done: state.trades.length > 0,
    },
    { title: "Track your progress", help: "See your learning wins and choose your next goal.", href: "/achievements", done: false },
  ];
  const next = steps.findIndex((s) => !s.done);
  return (
    <nav className="ds-path-steps" aria-label="Getting started path">
      {steps.map((s, i) => (
        <Link
          key={s.title}
          href={s.href}
          className={`${s.done ? "done" : ""} ${i === next ? "current" : ""}`}
          aria-current={i === next ? "step" : undefined}
        >
          <span>{s.done ? <Check size={14} /> : i + 1}</span>
          <span className="path-step-copy"><strong>{s.title}</strong><small>{s.help}</small></span>
          <ArrowRight size={13} />
        </Link>
      ))}
    </nav>
  );
}
