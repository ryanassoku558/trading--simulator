"use client";

import type { State } from "@/types";

import { achievements, earned } from "@/lib/education";

import { Trophy } from "lucide-react";
export default function Achievements({ state }: { state: State }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SMALL WINS ADD UP</span>
          <h1>Your milestones</h1>
          <p>
            You’ve earned {state.learning.xp} XP. Keep learning at your own
            pace.
          </p>
        </div>
        <span className="badge">
          {achievements.filter((a) => earned(state, a.id)).length} / 6 UNLOCKED
        </span>
      </div>
      <div className="achievement-grid">
        {achievements.map((a) => (
          <section
            key={a.id}
            className={`card achievement ${earned(state, a.id) ? "unlocked" : ""}`}
          >
            <span className="achievement-icon">
              <Trophy size={30} />
            </span>
            <span className="badge">
              {earned(state, a.id) ? "UNLOCKED" : "IN PROGRESS"}
            </span>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
          </section>
        ))}
      </div>
    </>
  );
}
