"use client";
import { useState } from "react";
import Link from "next/link";
import type { State } from "@/types";
import { lessons } from "@/lib/education";
import { learningModules } from "@/lib/billing/curriculum";
import LearningRetention from "../LearningRetention";
import { Panel } from "../ui/LearningUI";
import Achievements from "./Achievements";
export default function Progress({ state }: { state: State }) {
  const [view, setView] = useState("Overview"),
    done = new Set(state.learning.completed);
  const count = lessons.filter((l) => done.has(l.id)).length,
    modules = learningModules.filter((m) =>
      m.ids.every((id) => done.has(id)),
    ).length;
  return (
    <div className="compact-learning">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEE YOUR GROWTH</span>
          <h1>Your progress</h1>
          <p>Track learning, consistency, and achievements in one place.</p>
        </div>
        <Link className="primary" href="/learn">
          Continue learning →
        </Link>
      </div>
      <div
        className="learning-sections"
        role="group"
        aria-label="Progress sections"
      >
        {["Overview", "Achievements", "Habits & goals"].map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {v}
          </button>
        ))}
      </div>
      {view === "Habits & goals" ? (
        <LearningRetention state={state} />
      ) : view === "Overview" ? (
        <>
          <Panel title="Your learning growth">
            <progress
              aria-label="Full curriculum progress"
              value={count}
              max={lessons.length}
              style={{ width: "100%" }}
            />
            <p>
              {count} of {lessons.length} lessons completed across{" "}
              {learningModules.length} modules.
            </p>
          </Panel>
          <div className="compact-quick">
            {[
              {
                title: "Modules completed",
                value: `${modules}/${learningModules.length}`,
              },
              {
                title: "Lessons completed",
                value: `${count}/${lessons.length}`,
              },
              {
                title: "Learning streak",
                value: `${state.learning.streak} days`,
              },
              { title: "Experience earned", value: `${state.learning.xp} XP` },
            ].map((s) => (
              <article className="card" key={s.title}>
                <small>{s.title}</small>
                <h2>{s.value}</h2>
              </article>
            ))}
          </div>
          <div className="compact-quick">
            <Link className="card" href="/profile">
              <strong>Learning insights →</strong>
              <small>Your profile and study habits</small>
            </Link>
            <Link className="card" href="/portfolio">
              <strong>Simulator performance →</strong>
              <small>Your virtual portfolio</small>
            </Link>
            <button className="card" onClick={() => setView("Achievements")}>
              <strong>Achievements →</strong>
              <small>Browse earned and locked rewards</small>
            </button>
          </div>
        </>
      ) : (
        <Achievements state={state} />
      )}
    </div>
  );
}
