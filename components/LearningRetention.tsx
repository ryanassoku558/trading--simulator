"use client";
import { useState } from "react";
import Link from "next/link";
import { Flame, Trophy, Check } from "lucide-react";
import type { State } from "@/types";
import { achievements, earned } from "@/lib/education";
import { canEarnAchievement } from "@/lib/billing/achievements";
import { useSubscription } from "./Subscription";
import { Panel, ProgressMeter } from "./ui/LearningUI";
export function LearningSignals({ state }: { state: State }) {
  return (
    <div className="ds-learning-signals">
      <span>
        <Flame size={15} />
        {state.learning.streak} day streak
      </span>
      <span>
        <Trophy size={15} />
        {state.learning.xp} XP
      </span>
      <span>
        <Check size={15} />
        {state.learning.completed.length} lessons completed
      </span>
    </div>
  );
}
export function PracticeGoals({ state }: { state: State }) {
  const goals = [
    {
      title: "Complete your first practice trade",
      done: state.trades.length > 0,
    },
    {
      title: "Review a completed trade",
      done: !!state.journal?.some(
        (j) =>
          j.note.trim().length >= 20 &&
          state.trades.some((t) => t.id === j.tradeId),
      ),
    },
    {
      title: "Complete Market Basics",
      done: [1, 2, 3, 4].every((id) => state.learning.completed.includes(id)),
    },
  ];
  return (
    <Panel
      title="Practice with a purpose"
      description="Focus on learning and reflection, not a profit target."
    >
      <div className="ds-goal-list">
        {goals.map((g) => (
          <span key={g.title}>
            <span className={g.done ? "positive" : ""}>
              {g.done ? "✓" : "○"}
            </span>
            {g.title}
          </span>
        ))}
      </div>
      <Link className="secondary" href="/market/AAPL?guided=1">
        First-trade walkthrough →
      </Link>
    </Panel>
  );
}
export default function LearningRetention({ state }: { state: State }) {
  const { pro } = useSubscription();
  const badges = achievements.filter(
    (a) => canEarnAchievement(a.id, pro) && earned(state, a.id),
  );
  const [time, setTime] = useState("09:00"),
    [message, setMessage] = useState("");
  function reminder() {
    const [hour, minute] = time.split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    if (date <= new Date()) date.setDate(date.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0"),
      stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(hour)}${pad(minute)}00`;
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sprout Trading//Learning reminder//EN",
      "BEGIN:VEVENT",
      `UID:sprout-study-${Date.now()}@sprout-trading.vercel.app`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART:${stamp}`,
      "DURATION:PT5M",
      "RRULE:FREQ=DAILY",
      "SUMMARY:Five minutes with Sprout",
      "DESCRIPTION:Learn one concept and reflect on it.",
      "URL:https://sprout-trading.vercel.app/learn",
      "BEGIN:VALARM",
      "TRIGGER:-PT0M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Your Sprout learning reminder",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
        new Blob([content], { type: "text/calendar" }),
      ),
      link = document.createElement("a");
    link.href = url;
    link.download = "sprout-learning-reminder.ics";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Calendar file downloaded. Import it into your calendar to activate the reminder. Edit or remove it there anytime.",
    );
  }
  return (
    <div className="ds-retention-grid">
      <Panel title="Small steps add up">
        <LearningSignals state={state} />
        <ProgressMeter
          value={Math.min(5, state.learning.completed.length)}
          max={5}
          label="First five lessons"
        />
        <p>{badges.length} achievements earned.</p>
        <div className="ds-badge-list">
          {badges.slice(-3).map((a) => (
            <span key={a.id}>
              <Trophy size={14} />
              {a.title}
            </span>
          ))}
          {badges.length === 0 && (
            <small>Your first completed lesson starts your collection.</small>
          )}
        </div>
        <Link href="/learn" className="secondary">
          Continue your learning path →
        </Link>
      </Panel>
      <PracticeGoals state={state} />
      <Panel
        title="Make time to learn"
        description="An optional five-minute daily reminder in your own calendar."
      >
        <label>
          Reminder time (your local timezone)
          <input
            type="time"
            aria-label="Daily reminder time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <button className="secondary" disabled={!time} onClick={reminder}>
          Add daily calendar reminder
        </button>
        <p className="small">
          You choose whether to import it. Sprout does not send reminder emails
          or browser notifications.
        </p>
        <p role="status">{message}</p>
      </Panel>
    </div>
  );
}
