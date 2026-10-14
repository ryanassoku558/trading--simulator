"use client";
import { useState } from "react";
import type { Lesson } from "@/types";
import { StudyBlock } from "./ui/LearningUI";
import InlineGlossary from "./InlineGlossary";
import BeginnerExercise from "./BeginnerExercise";
import CandleLessonExample from "./CandleLessonExample";
import StrategyLessonChart from "./StrategyLessonChart";
import TutorialVideo from "./TutorialVideo";
import tutorials from "@/lib/education/tutorials.json";
import { useSubscription } from "./Subscription";
import { canWatchTutorial } from "@/lib/billing/benefits";
import { moduleScenario } from "@/lib/education/scenarios";
export default function LessonStudy({
  lesson,
  stage,
  moduleMode,
}: {
  lesson: Lesson;
  stage: number;
  moduleMode: boolean;
}) {
  const [tab, setTab] = useState(0),
    { pro, upgrade } = useSubscription();
  const view = moduleMode ? tab : stage;
  const video = tutorials.find((t) => t.lessonIds.includes(lesson.id));
  return (
    <div className="ds-lesson-study">
      <p className="ds-description">{lesson.why}</p>
      {moduleMode && (
        <div
          className="learning-sections"
          role="group"
          aria-label="Lesson material"
        >
          {["Concepts", "Examples", "Practice & summary"].map((t, i) => (
            <button key={t} aria-pressed={tab === i} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>
      )}
      {view === 0 && (
        <>
          <StudyBlock title="Key concepts">
            <div className="lesson-copy">
              <InlineGlossary text={lesson.explanation} />
            </div>
            <small>Underlined terms open a plain-language definition.</small>
          </StudyBlock>
          {video && (
            <details className="ds-extra">
              <summary>Watch a short tutorial</summary>
              {canWatchTutorial(video.slug, pro) ? (
                <TutorialVideo slug={video.slug} />
              ) : (
                <button
                  className="secondary"
                  onClick={() => upgrade("This video tutorial")}
                >
                  Unlock tutorial with Pro
                </button>
              )}
            </details>
          )}
        </>
      )}
      {view === 1 && (
        <StudyBlock title="Worked example">
          <div className="example">
            <InlineGlossary text={lesson.example} />
          </div>
          <CandleLessonExample lessonId={lesson.id} />
          <StrategyLessonChart lessonId={lesson.id} />
          <BeginnerExercise lessonId={lesson.id} />
        </StudyBlock>
      )}
      {view === 2 && (
        <>
          <StudyBlock title="Practice prompt">
            <p>{moduleScenario(lesson.level).question}</p>
            <details className="ds-extra">
              <summary>Show the reasoning</summary>
              <p>{moduleScenario(lesson.level).explanation}</p>
            </details>
            <label className="presentation-reflection">
              Your takeaway (optional)
              <textarea placeholder="What would you consider before acting?" />
            </label>
          </StudyBlock>
          <StudyBlock title="Summary">
            <InlineGlossary text={lesson.why} />
            <p className="small">
              Your quiz has five questions. Answer at least four correctly to
              pass.
            </p>
          </StudyBlock>
        </>
      )}
    </div>
  );
}
