"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import LearningPathSteps from "./LearningPathSteps";
import LearningDiscovery from "./LearningDiscovery";
import { useSubscription } from "./Subscription";
import { learningModules } from "@/lib/billing/curriculum";
import { canLearn, starterLessonIds } from "@/lib/billing/access";

import TutorialHub from "./TutorialHub";
import LessonPresentation from "./LessonPresentation";
import { BookOpen, Check, ArrowRight, Search, Lock } from "lucide-react";
import { lessons, levels, beginnerLearningOrder } from "@/lib/education";
import type { State, Lesson } from "@/types";
export default function Learning({
  state,
  update,
}: {
  state: State;
  update: (s: State) => void | Promise<unknown>;
  firstTrade: () => void;
}) {
  const { pro, upgrade } = useSubscription();
  const modules = learningModules;
  const hash = useSyncExternalStore(
    (callback) => {
      window.addEventListener("hashchange", callback);
      return () => window.removeEventListener("hashchange", callback);
    },
    () => window.location.hash,
    () => "",
  );
  const router = useRouter();
  const params = useSearchParams();
  const requestedView =
    params.get("view") === "Videos"
      ? "Tutorials"
      : params.get("view") || "Overview";
  const section = [
    "Overview",
    "Lessons",
    "Modules",
    "Glossary",
    "Tutorials",
  ].includes(requestedView)
    ? requestedView
    : "Overview";
  const currentSection =
    hash === "#tutorials"
      ? "Tutorials"
      : ["#glossary", "#beginner-mistakes"].includes(hash)
        ? "Glossary"
        : hash === "#curriculum"
          ? "Modules"
          : section;
  function selectSection(value: string) {
    router.push(
      `/learn?view=${encodeURIComponent(value)}${value === "Lessons" ? "&lesson=1" : ""}`,
      { scroll: false },
    );
    setLibraryPage(0);
  }
  const [libraryPage, setLibraryPage] = useState(0);

  const [topic, setTopic] = useState("All topics"),
    [search, setSearch] = useState("");
  const matches = (lesson: Lesson) =>
    (topic === "All topics" ||
      (topic === "Personal finance" &&
        lesson.level >= 13 &&
        lesson.level <= 22) ||
      (topic === "Trading" && lesson.level <= 12) ||
      (topic === "Advanced trading" && lesson.level >= 23)) &&
    `${levels[lesson.level - 1]} ${lesson.title} ${lesson.explanation} ${lesson.example}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .includes(
        search
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, ""),
      );
  const visibleLessons = lessons.filter(matches);
  const matchingModules = modules
    .map((_, i) => i)
    .filter((i) => visibleLessons.some((l) => modules[i].ids.includes(l.id)));
  const shownModules = matchingModules.slice(
    libraryPage * 6,
    libraryPage * 6 + 6,
  );
  const shownLessons = visibleLessons.slice(
    libraryPage * 8,
    libraryPage * 8 + 8,
  );
  const requestedLesson = Number(useSearchParams().get("lesson"));
  const [active, setActive] = useState<Lesson | null>(
      () =>
        lessons.find(
          (lesson) => lesson.id === requestedLesson && canLearn(lesson.id, pro),
        ) || null,
    ),
    [followingPath, setFollowingPath] = useState(
      Boolean(requestedLesson && state.profile.experience === "new"),
    );
  const [moduleMode, setModuleMode] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Lesson[]>([]),
    [activeTitle, setActiveTitle] = useState("");
  function open(l: Lesson, path = false, module = false) {
    if (!canLearn(l.id, pro)) {
      upgrade("The full lesson library");
      return;
    }
    setActiveGroup(
      module
        ? lessons.filter((lesson) =>
            modules.find((m) => m.ids.includes(l.id))?.ids.includes(lesson.id),
          )
        : [l],
    );
    setActiveTitle(modules.find((m) => m.ids.includes(l.id))?.title || "");
    setModuleMode(module);
    setFollowingPath(path);
    setActive(l);
  }
  const ids = pro ? beginnerLearningOrder : starterLessonIds;
  const next =
    lessons.find(
      (l) =>
        l.id ===
        (ids.find((id) => !state.learning.completed.includes(id)) ?? ids[0]),
    ) || lessons[0];
  const completed = new Set(state.learning.completed);
  const pageCount = Math.max(
    1,
    Math.ceil(
      (currentSection === "Lessons"
        ? visibleLessons.length
        : matchingModules.length) / (currentSection === "Lessons" ? 8 : 6),
    ),
  );
  return (
    <div className="compact-learning motion-surface" key={currentSection}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR LEARNING WORKSPACE</span>
          <h1>
            {currentSection === "Overview"
              ? "Learn, one step at a time"
              : currentSection}
          </h1>
          <p>
            Short lessons, clear examples, five-question quizzes. Score 80% to
            pass.
          </p>
        </div>
        <span className="badge">
          {completed.size} lessons completed · {state.learning.xp} XP
        </span>
      </div>
      <div
        className="learning-sections compact-tabs"
        role="group"
        aria-label="Learning sections"
      >
        {["Overview", "Lessons", "Modules", "Glossary", "Tutorials"].map(
          (value) => (
            <button
              key={value}
              aria-pressed={currentSection === value}
              className={currentSection === value ? "active" : ""}
              onClick={() => selectSection(value)}
            >
              {value}
            </button>
          ),
        )}
      </div>
      {currentSection === "Overview" && (
        <>
          <LearningPathSteps state={state} />
          <section className="card compact-next">
            <div>
              <span className="eyebrow">
                {completed.size
                  ? "YOUR NEXT STEP"
                  : "START HERE · NO EXPERIENCE NEEDED"}
              </span>
              <h2>{next.title}</h2>
              <p>Learn the concept, try an example, then take a short quiz.</p>
            </div>
            <button className="primary" onClick={() => open(next, true)}>
              {completed.size ? "Continue learning" : "Start first lesson"}
              <ArrowRight size={16} />
            </button>
          </section>
          <div className="compact-quick" aria-label="Quick access">
            {[
              {
                label: "Glossary",
                text: "Definitions & games",
                href: "/learn?view=Glossary",
              },
              {
                label: "Tools",
                text: "Plan your practice trades",
                href: "/tools",
              },
              {
                label: "Simulator",
                text: "Practice with virtual money",
                href: "/market",
              },
              {
                label: "Progress",
                text: "Review milestones",
                href: "/achievements",
              },
            ].map((item) => (
              <Link className="card" key={item.label} href={item.href}>
                <strong>
                  {item.label} <ArrowRight size={15} />
                </strong>
                <small>{item.text}</small>
              </Link>
            ))}
          </div>
          <div className="compact-section-heading">
            <h2>Your learning path</h2>
            <button
              className="text-link"
              onClick={() => selectSection("Modules")}
            >
              All {modules.length} modules →
            </button>
          </div>
          <div className="compact-module-grid">
            {modules.slice(0, 3).map((m, i) => (
              <article className="card compact-module" key={m.title}>
                <span className="eyebrow">MODULE {i + 1}</span>
                <h3>{m.title}</h3>
                <p>
                  {m.ids.filter((id) => completed.has(id)).length}/
                  {m.ids.length} lessons complete
                </p>
                <progress
                  value={m.ids.filter((id) => completed.has(id)).length}
                  max={m.ids.length}
                  aria-label={`${m.title} progress`}
                />
                <button
                  className="secondary"
                  onClick={() =>
                    open(
                      lessons.find((l) => m.ids.includes(l.id))!,
                      false,
                      true,
                    )
                  }
                >
                  Open module
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {currentSection === "Tutorials" && <TutorialHub />}
      {currentSection === "Glossary" && <LearningDiscovery />}
      {requestedLesson > 0 && !canLearn(requestedLesson, pro) && (
        <section className="card pro-lock">
          <h3>This lesson is part of Sprout Pro.</h3>
          <button className="primary" onClick={() => upgrade("This lesson")}>
            Explore Pro
          </button>
        </section>
      )}
      {["Lessons", "Modules"].includes(currentSection) && (
        <>
          <div className="compact-library-controls">
            <label className="curriculum-search">
              <Search size={18} />
              <input
                aria-label="Search lessons"
                type="search"
                placeholder="Search modules or lessons…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLibraryPage(0);
                }}
              />
            </label>
            <select
              aria-label="Learning path"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setLibraryPage(0);
              }}
            >
              {[
                "All topics",
                "Personal finance",
                "Trading",
                "Advanced trading",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <span className="small">
              {lessons.length} lessons · {modules.length} modules
            </span>
          </div>
          <p className="small">
            {pro
              ? "Full curriculum unlocked."
              : "First 5 modules and 20 lessons included. Pro content stays visible and locked."}
          </p>
          {currentSection === "Lessons" ? (
            <div className="compact-lesson-grid">
              {shownLessons.map((l) => (
                <button
                  className="card compact-lesson"
                  key={l.id}
                  onClick={() => open(l)}
                >
                  <span className="lesson-dot">
                    {!canLearn(l.id, pro) ? (
                      <Lock size={16} />
                    ) : completed.has(l.id) ? (
                      <Check size={16} />
                    ) : (
                      <BookOpen size={16} />
                    )}
                  </span>
                  <span>
                    <strong>{l.title}</strong>
                    <small>
                      {modules.find((m) => m.ids.includes(l.id))?.title} ·{" "}
                      {canLearn(l.id, pro) ? "5-question quiz" : "Pro · Locked"}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            <div className="compact-module-grid">
              {shownModules.map((i) => {
                const m = modules[i],
                  done = m.ids.filter((id) => completed.has(id)).length;
                return (
                  <details className="card compact-module" key={m.title}>
                    <summary>
                      <span className="eyebrow">
                        MODULE {i + 1} ·{" "}
                        {!pro && i >= 5
                          ? "PRO · LOCKED"
                          : i < 5
                            ? "STARTER"
                            : "PRO"}
                      </span>
                      <h3>{m.title}</h3>
                      <small>
                        {done}/{m.ids.length} complete · Expand lessons
                      </small>
                      <progress
                        value={done}
                        max={m.ids.length}
                        aria-label={`${m.title} progress`}
                      />
                    </summary>
                    <button
                      className="secondary"
                      onClick={() =>
                        open(
                          lessons.find((l) => m.ids.includes(l.id))!,
                          false,
                          true,
                        )
                      }
                    >
                      {!pro && i >= 5 ? "Unlock with Pro" : "Start module quiz"}
                    </button>
                    <div className="compact-module-lessons">
                      {lessons
                        .filter((l) => m.ids.includes(l.id) && matches(l))
                        .map((l) => (
                          <button key={l.id} onClick={() => open(l)}>
                            {completed.has(l.id) ? (
                              <Check size={14} />
                            ) : !canLearn(l.id, pro) ? (
                              <Lock size={14} />
                            ) : (
                              <BookOpen size={14} />
                            )}{" "}
                            {l.title}
                            <ArrowRight size={14} />
                          </button>
                        ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
          {visibleLessons.length === 0 && (
            <p className="card">No matches. Try another search or topic.</p>
          )}
          <nav className="compact-pagination" aria-label="Curriculum pages">
            <button
              className="secondary"
              disabled={libraryPage === 0}
              onClick={() => setLibraryPage(libraryPage - 1)}
            >
              Previous
            </button>
            <span role="status">
              Page {libraryPage + 1} of {pageCount}
            </span>
            <button
              className="secondary"
              disabled={libraryPage + 1 >= pageCount}
              onClick={() => setLibraryPage(libraryPage + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
      {active && canLearn(active.id, pro) && (
        <LessonPresentation
          key={`${active.id}-${moduleMode}`}
          title={moduleMode ? activeTitle : undefined}
          group={activeGroup.length ? activeGroup : [active]}
          moduleMode={moduleMode}
          state={state}
          update={update}
          onClose={() => setActive(null)}
          onContinue={(module) => {
            const moduleIndex = modules.findIndex((m) =>
              m.ids.includes(active.id),
            );
            const ids = pro ? beginnerLearningOrder : starterLessonIds;
            const next = module
              ? lessons.find((l) => l.id === modules[moduleIndex + 1]?.ids[0])
              : lessons.find((l) => l.id === ids[ids.indexOf(active.id) + 1]);
            if (next) open(next, followingPath, module);
            else setActive(null);
          }}
        />
      )}
    </div>
  );
}
