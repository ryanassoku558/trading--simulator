"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sprouty from "./Sprouty";
import {LearningRoadmap} from "./VisualLearning";
import ChartPractice from "./ChartPractice";
import TutorialLibrary from "./TutorialLibrary";
import TutorialVideo from "./TutorialVideo";
import tutorials from "@/lib/education/tutorials.json";
import CandleLessonExample from "./CandleLessonExample";
import BeginnerExercise from "./BeginnerExercise";
import { BookOpen, Check, ArrowRight, Lightbulb } from "lucide-react";
import {
  lessons,
  levels,
  answerLesson,
  beginnerLearningOrder,
  accountRulesMetadata,
} from "@/lib/education";
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
  const requestedLesson = Number(useSearchParams().get("lesson"));
  const [active, setActive] = useState<Lesson | null>(
      () => lessons.find((lesson) => lesson.id === requestedLesson) || null,
    ),
    [answer, setAnswer] = useState<number | null>(null),
    [feedback, setFeedback] = useState(""),
    [followingPath, setFollowingPath] = useState(
      Boolean(requestedLesson && state.profile.experience === "new"),
    );
  function open(l: Lesson, path = false) {
    setFollowingPath(path);
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
          {state.learning.completed.length} / {lessons.length} lessons
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
      <Sprouty completed={state.learning.completed.length}/>
      <LearningRoadmap state={state} onNavigate={url=>{const id=Number(new URL(url,"https://sprout.local").searchParams.get("lesson"));const lesson=lessons.find(l=>l.id===id);if(lesson)open(lesson);}}/>
      <TutorialLibrary />
      <ChartPractice/>
      <section className="card beginner-path">
        <div>
          <span className="eyebrow">
            START HERE · NO PRIOR KNOWLEDGE NEEDED
          </span>
          <h2>Before your first trade</h2>
          <p>
            Build a foundation in stocks, quotes, orders, and possible losses
            before moving to charts. This recommended path covers all{" "}
            {lessons.length} lessons. You can still explore any lesson
            independently.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            const id =
              beginnerLearningOrder.find(
                (id) => !state.learning.completed.includes(id),
              ) ?? beginnerLearningOrder[0];
            open(lessons.find((l) => l.id === id)!, true);
          }}
        >
          Start beginner path <ArrowRight size={16} />
        </button>
      </section>
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
              /{lessons.filter((l) => l.level === i + 1).length} complete
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
          {tutorials.find(t=>t.lessonIds.includes(active.id)) && <TutorialVideo key={active.id} slug={tutorials.find(t=>t.lessonIds.includes(active.id))!.slug}/>}
          <p className="lesson-copy">{active.explanation}</p>
          <div className="example">
            <span className="eyebrow">LET’S MAKE IT REAL</span>
            <p>{active.example}</p>
            <CandleLessonExample lessonId={active.id} />
            <BeginnerExercise key={active.id} lessonId={active.id} />
          </div>
          <div className="tip">
            <Lightbulb size={19} />
            <div>
              <strong>Why this matters</strong>
              <p>{active.why}</p>
            </div>
          </div>
          {[32, 39, 40, 48].includes(active.id) && (
            <aside className="lesson-sources">
              <strong>Scope and current requirements</strong>
              <p>{accountRulesMetadata.scope}</p>
              <small>
                Content updated {accountRulesMetadata.updated}; verify rules
                with official sources and your broker.
              </small>
              <div>
                {accountRulesMetadata.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.label} ↗
                  </a>
                ))}
              </div>
            </aside>
          )}
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
                if (
                  !followingPath &&
                  active.id === 1 &&
                  state.trades.length === 0
                ) {
                  setActive(null);
                  firstTrade();
                } else {
                  const nextId = followingPath
                    ? beginnerLearningOrder[
                        beginnerLearningOrder.indexOf(active.id) + 1
                      ]
                    : active.id + 1;
                  const next = lessons.find((l) => l.id === nextId);
                  if (next) open(next, followingPath);
                  else setActive(null);
                }
              }}
            >
              {!followingPath && active.id === 1 && state.trades.length === 0
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
