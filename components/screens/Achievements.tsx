"use client";

import Sprouty from "../Sprouty";
import type { State } from "@/types";

import { achievements, earned } from "@/lib/education";

import { Trophy, BookOpen, CandlestickChart, ShieldCheck, Flame } from "lucide-react";
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
          {achievements.filter((a) => earned(state, a.id)).length} / {achievements.length} UNLOCKED
        </span>
      </div>
      <Sprouty completed={state.learning.completed.length}/>
      <div className="achievement-grid">
        {achievements.map((a, i) => {const Icon=a.id==="chart"?CandlestickChart:a.id==="risk"?ShieldCheck:a.id==="streak"?Flame:a.id==="lesson"?BookOpen:Trophy;const tier=i<3?"Bronze":i<6?"Silver":"Gold";return (
          <section
            key={a.id}
            data-tier={tier.toLowerCase()}
            className={`card achievement ${earned(state, a.id) ? "unlocked" : ""}`}
          >
            <span className="achievement-icon">
              <Icon size={30} />
            </span>
            <span className="badge">
              {earned(state, a.id) ? "UNLOCKED" : "IN PROGRESS"}
            </span>
            <small className="achievement-tier">{tier} milestone</small>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
          </section>
        );})}
      </div>
    </>
  );
}
