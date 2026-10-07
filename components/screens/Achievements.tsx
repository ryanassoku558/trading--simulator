"use client";

import {useSubscription} from "../Subscription";
import {canEarnAchievement,starterAchievementCount} from "@/lib/billing/achievements";
import Sprouty from "../Sprouty";
import type { State } from "@/types";

import { achievements, earned } from "@/lib/education";

import { Trophy, BookOpen, CandlestickChart, ShieldCheck, Flame, Lock } from "lucide-react";
export default function Achievements({ state }: { state: State }) {
  const {pro,upgrade}=useSubscription();
  const earnedCount=achievements.filter(a=>canEarnAchievement(a.id,pro)&&earned(state,a.id)).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SMALL WINS ADD UP</span>
          <h1>Your milestones</h1>
          <p>
            Track the badges and experience points (XP) you earn through learning and practice. You’ve earned {state.learning.xp} XP. {pro?`All ${achievements.length} milestones are available to earn.`:`The first ${starterAchievementCount} milestones are available on Starter; the remaining ${achievements.length-starterAchievementCount} require Pro.`}
          </p>
        </div>
        <span className="badge">
          {earnedCount} / {achievements.length} EARNED
        </span>
      </div>
      <Sprouty completed={state.learning.completed.length}/>
      <div className="achievement-grid">
        {achievements.map((a, i) => {const accessible=canEarnAchievement(a.id,pro),isEarned=accessible&&earned(state,a.id);const Icon=a.id==="chart"?CandlestickChart:a.id==="risk"?ShieldCheck:a.id==="streak"?Flame:a.id==="lesson"?BookOpen:Trophy;const moduleLevel=a.id.startsWith("module-")?Number(a.id.slice(7)):0;const tier=moduleLevel?(moduleLevel<=22?"Bronze":"Silver"):i<3?"Bronze":i<6?"Silver":"Gold";return (
          <section
            key={a.id}
            data-tier={tier.toLowerCase()}
            className={`card achievement ${isEarned ? "unlocked" : ""} ${!accessible?"pro-locked":""}`}
          >
            <span className="achievement-icon">
              <Icon size={30} />
            </span>
            <span className="badge">
              {!accessible?<><Lock size={12}/> PRO · LOCKED</>:isEarned?"EARNED":"AVAILABLE TO EARN"}
            </span>
            <small className="achievement-tier">{tier} milestone</small>
            <h2>{a.title}</h2>
            <p>{a.description}</p>{!accessible&&<button className="secondary" onClick={()=>upgrade(`${a.title} achievement`)}>Unlock with Pro</button>}
          </section>
        );})}
      </div>
    </>
  );
}
