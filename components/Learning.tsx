"use client";
import { useState } from "react";
import { BookOpen, Check, ArrowRight, Lightbulb } from "lucide-react";
import { lessons, levels, answerLesson } from "@/lib/education";
import type { State, Lesson } from "@/types";
import Dialog from "./Dialog";
export default function Learning({
  state,
  update,
  firstTrade,
}: {
  state: State;
  update: (s: State) => void;
  firstTrade: () => void;
}) {
  const [active, setActive] = useState<Lesson | null>(null),
    [answer, setAnswer] = useState<number | null>(null),
    [feedback, setFeedback] = useState("");
  function open(l: Lesson) {
    setActive(l);
    setAnswer(null);
    setFeedback("");
  }
  function check() {
    if (active && answer !== null) {
      const next = answerLesson(state, active.id, answer);
      update(next);
      setFeedback(answer === active.quiz.answer ? "correct" : "incorrect");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            A LITTLE KNOWLEDGE. A LOT MORE CONFIDENCE.
          </span>
          <h1>Your learning journey</h1>
          <p>
            {state.profile.experience === "new"
              ? "Start from zero, one small lesson at a time."
              : state.profile.experience === "basics"
                ? "Review the basics or jump to placing trades."
                : "Refresh any topic, or explore portfolio building."}{" "}
            Every level is open to explore.
          </p>
        </div>
        <div className="badge">
          <BookOpen size={16} />
          {state.learning.completed.length} / 25 lessons
        </div>
      </div>
      <div className="journey-summary card">
        <div>
          <strong>{state.learning.xp} XP</strong>
          <span>Total experience</span>
        </div>
        <div>
          <strong>{state.learning.streak} days</strong>
          <span>Learning streak</span>
        </div>
        <div>
          <strong>
            {state.learning.attempts.length
              ? Math.round(
                  (state.learning.attempts.filter((a) => a.correct).length /
                    state.learning.attempts.length) *
                    100,
                )
              : 0}
            %
          </strong>
          <span>Quiz accuracy</span>
        </div>
      </div>
      {levels.map((level, i) => (
        <section className="card level" key={level}>
          <div className="level-heading">
            <div className="level-icon">{i + 1}</div>
            <div>
              <div className="eyebrow">LEVEL {i + 1}</div>
              <h2>{level}</h2>
            </div>
            <span className="muted">
              {
                lessons.filter(
                  (l) =>
                    l.level === i + 1 &&
                    state.learning.completed.includes(l.id),
                ).length
              }
              /5 complete
            </span>
          </div>
          <div className="lesson-list">
            {lessons
              .filter((l) => l.level === i + 1)
              .map((l) => (
                <button
                  key={l.id}
                  onClick={() => open(l)}
                  className="lesson-row"
                >
                  <span
                    className={
                      state.learning.completed.includes(l.id)
                        ? "lesson-dot done"
                        : "lesson-dot"
                    }
                  >
                    {state.learning.completed.includes(l.id) ? (
                      <Check size={16} />
                    ) : (
                      <BookOpen size={16} />
                    )}
                  </span>
                  <span>
                    {l.title}
                    <small>3 min · +35 XP on first completion</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
          </div>
        </section>
      ))}
      {active && (
        <Dialog title={active.title} onClose={() => setActive(null)}>
          <div className="eyebrow">LEVEL {active.level} · BITE-SIZE LESSON</div>
          <p className="lesson-copy">{active.explanation}</p>
          <div className="example">
            <span className="eyebrow">LET’S MAKE IT REAL</span>
            <p>{active.example}</p>
          </div>
          <div className="tip">
            <Lightbulb size={19} />
            <div>
              <strong>Why this matters</strong>
              <p>{active.why}</p>
            </div>
          </div>
          <h3>Quick knowledge check</h3>
          <p>{active.quiz.question}</p>
          <div className="quiz-options">
            {active.quiz.options.map((o, i) => (
              <button
                className={answer === i ? "chosen" : ""}
                key={o}
                disabled={feedback === "correct"}
                onClick={() => {
                  setAnswer(i);
                  setFeedback("");
                }}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            ))}
          </div>
          {feedback && (
            <p
              role="status"
              className={feedback === "correct" ? "success" : "error"}
            >
              {feedback === "correct"
                ? "Correct! +35 XP on your first completion."
                : "Not quite. Try again."}{" "}
              {active.quiz.explanation}
            </p>
          )}
          {feedback === "correct" ? (
            <button
              className="primary full"
              onClick={() => {
                if (active.id === 1 && state.trades.length === 0) {
                  setActive(null);
                  firstTrade();
                } else {
                  const next = lessons.find((l) => l.id === active.id + 1);
                  if (next) open(next);
                  else setActive(null);
                }
              }}
            >
              {active.id === 1 && state.trades.length === 0
                ? "Make your first practice trade"
                : "Continue"}{" "}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="primary full"
              disabled={answer === null}
              onClick={check}
            >
              Check answer
            </button>
          )}
        </Dialog>
      )}
    </>
  );
}
