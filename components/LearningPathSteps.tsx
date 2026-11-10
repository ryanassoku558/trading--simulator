import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { State } from "@/types";
import { starterModules } from "@/lib/billing/access";
export default function LearningPathSteps({ state }: { state: State }) {
  const steps = [
    {
      title: "Learn the basics",
      href: "/learn?lesson=1",
      done: state.learning.completed.includes(1),
    },
    {
      title: "Complete Module 1",
      href: "/learn?view=Modules",
      done: starterModules[0].ids.every((id) =>
        state.learning.completed.includes(id),
      ),
    },
    {
      title: "Try a practice trade",
      href: "/market/AAPL?guided=1",
      done: state.trades.length > 0,
    },
    { title: "Track your progress", href: "/achievements", done: false },
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
          <strong>{s.title}</strong>
          <ArrowRight size={13} />
        </Link>
      ))}
    </nav>
  );
}
