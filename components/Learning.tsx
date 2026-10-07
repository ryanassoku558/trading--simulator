"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LearningDiscovery from "./LearningDiscovery";
import {useSubscription} from "./Subscription";
import {learningModules} from "@/lib/billing/curriculum";
import {canLearn,starterLessonIds} from "@/lib/billing/access";
import Sprouty from "./Sprouty";
import TutorialLibrary from "./TutorialLibrary";
import LessonPresentation from "./LessonPresentation";
import { BookOpen, Check, ArrowRight, Search, Trophy, Lock } from "lucide-react";
import {
  lessons,
  levels,
  beginnerLearningOrder,
} from "@/lib/education";
import type { State, Lesson } from "@/types";
export default function Learning({
  state,
  update,
}: {
  state: State;
  update: (s: State) => void | Promise<unknown>;
  firstTrade: () => void;
}) {
  const {pro,upgrade}=useSubscription();
  const modules=learningModules;
  const hash=useSyncExternalStore(callback=>{window.addEventListener('hashchange',callback);return()=>window.removeEventListener('hashchange',callback);},()=>window.location.hash,()=>"");
  const [section,setSection]=useState("Modules & lessons");
  const currentSection=hash==="#tutorials"?"Video tutorials":["#glossary","#beginner-mistakes"].includes(hash)?"Glossary & habits":hash==="#curriculum"?"Modules & lessons":section;
  function selectSection(value:string){window.history.replaceState(null,"",window.location.pathname+window.location.search);setSection(value);window.dispatchEvent(new HashChangeEvent('hashchange'));}
  const [moduleLimit,setModuleLimit]=useState(6);
  const [topic,setTopic]=useState("All topics"),[search,setSearch]=useState("");
  const matches=(lesson:Lesson)=>((topic==="All topics")||(topic==="Personal finance"&&lesson.level>=13&&lesson.level<=22)||(topic==="Trading"&&lesson.level<=12)||(topic==="Advanced trading"&&lesson.level>=23))&&`${levels[lesson.level-1]} ${lesson.title} ${lesson.explanation} ${lesson.example}`.toLowerCase().replace(/[^a-z0-9]/g,'').includes(search.trim().toLowerCase().replace(/[^a-z0-9]/g,''));
  const visibleLessons=lessons.filter(matches);
  const matchingModules=modules.map((_,i)=>i).filter(i=>visibleLessons.some(l=>modules[i].ids.includes(l.id)));
  const shownModules=search?matchingModules:matchingModules.slice(0,moduleLimit);
  const requestedLesson = Number(useSearchParams().get("lesson"));
  const [active, setActive] = useState<Lesson | null>(
      () => lessons.find((lesson) => lesson.id === requestedLesson && canLearn(lesson.id,pro)) || null,
    ),
    [followingPath, setFollowingPath] = useState(
      Boolean(requestedLesson && state.profile.experience === "new"),
    );
  const [moduleMode,setModuleMode]=useState(false);
  const [activeGroup,setActiveGroup]=useState<Lesson[]>([]),[activeTitle,setActiveTitle]=useState("");
  function open(l: Lesson, path = false, module = false) {
    if(!canLearn(l.id,pro)){upgrade("The full lesson library");return;}
    setActiveGroup(module?lessons.filter(lesson=>modules.find(m=>m.ids.includes(l.id))?.ids.includes(lesson.id)):[l]);
    setActiveTitle(modules.find(m=>m.ids.includes(l.id))?.title||"");
    setModuleMode(module);
    setFollowingPath(path);
    setActive(l);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            A LITTLE KNOWLEDGE. A LOT MORE CONFIDENCE.
          </span>
          <h1>Your learning journey</h1>
          <p>Build your understanding with modules containing short lessons, examples, and five-question quizzes. Choose a module, learn the material, then score at least 80% to complete it.</p>
        </div>
        <div className="badge">
          <BookOpen size={16} />
          {state.learning.completed.filter(id=>canLearn(id,pro)).length} / {pro?lessons.length:20} lessons
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
      <div className="learning-sections" role="group" aria-label="Learning sections">{["Modules & lessons","Video tutorials","Glossary & habits"].map(value=><button aria-pressed={currentSection===value} className={currentSection===value?"active":""} key={value} onClick={()=>selectSection(value)}>{value}</button>)}<Link href="/practice#chart-practice">Chart practice →</Link></div>
      {currentSection==="Video tutorials"&&<TutorialLibrary/>}
      {currentSection==="Glossary & habits"&&<LearningDiscovery/>}
      {requestedLesson>0&&!canLearn(requestedLesson,pro)&&<section className="card pro-lock"><h3>This lesson is part of Sprout Pro.</h3><button className="primary" onClick={()=>upgrade("This lesson")}>Explore Pro</button></section>}
      {currentSection==="Modules & lessons"&&<>
      <section className="card beginner-path">
        <div>
          <span className="eyebrow">
            START HERE · NO PRIOR KNOWLEDGE NEEDED
          </span>
          <h2>Before your first trade</h2>
          <p>
            Build a foundation in stocks, quotes, orders, and possible losses
            before moving to charts. Follow the curriculum module by module, at your own pace.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            const id =
              (pro?beginnerLearningOrder:starterLessonIds).find(
                (id) => !state.learning.completed.includes(id),
              ) ?? beginnerLearningOrder[0];
            open(lessons.find((l) => l.id === id)!, true);
          }}
        >
          Start beginner path <ArrowRight size={16} />
        </button>
      </section>
      <section className="card curriculum-browser" id="curriculum"><div className="card-heading"><div><span className="eyebrow">YOUR TRADING & PERSONAL FINANCE LIBRARY</span><h2>Modules & lessons</h2><p>{lessons.length} lessons across {modules.length} modules. {pro?"Your full curriculum is unlocked.":"Starter includes the first five modules and 20 lessons. Browse the Pro curriculum below."}</p></div><Trophy size={25}/></div><div className="curriculum-topics" role="group" aria-label="Curriculum topic">{["All topics","Personal finance","Trading","Advanced trading"].map(t=><button key={t} aria-pressed={topic===t} className={topic===t?"active":""} onClick={()=>{setTopic(t);setModuleLimit(6);}}>{t}</button>)}</div><label className="curriculum-search"><Search size={18}/><input aria-label="Search lessons" type="search" placeholder="Search modules or lessons…" value={search} onChange={e=>setSearch(e.target.value)}/></label><p className="small" role="status">{visibleLessons.length} matching lessons · +35 XP per first completion · +100 XP per completed module</p></section>
      <Sprouty compact completed={state.learning.completed.length}/>
      {visibleLessons.length===0&&<p className="card">No lessons match your search. Try a broader term or another topic.</p>}
      {modules.map((module, i) => shownModules.includes(i)&&(

        <section className={`card level ${!pro&&i>=5?"locked-module":""}`} key={module.title}>
          <div className="level-heading">
            <div className="level-icon">{!pro&&i>=5?<Lock size={19}/>:i+1}</div>
            <div>
              <div className="eyebrow">MODULE {i + 1} · {i<5?"STARTER":(!pro?"SPROUT PRO · LOCKED":"SPROUT PRO")}</div>
              <h2>{module.title}</h2>
            </div>
            <span className="muted">
              {
                lessons.filter(
                  (l) =>
                    module.ids.includes(l.id) &&
                    state.learning.completed.includes(l.id),
                ).length
              }
              /{lessons.filter((l) => module.ids.includes(l.id)).length} complete
            </span>
          </div>
          <div className="module-reward"><Trophy size={16}/>{lessons.filter(l=>module.ids.includes(l.id)).every(l=>state.learning.completed.includes(l.id))?"Module complete · completion XP earned":"Complete this module to earn +100 XP"}{i>=12&&" and a mastery badge"}</div>
          <button className="secondary" onClick={()=>open(lessons.find(l=>module.ids.includes(l.id))!,false,true)}>{!pro&&i>=5?<><Lock size={15}/> Unlock module with Pro</>:"Start module presentation & quiz"}</button>
          <details className="module-lessons" open={!!search||i===0}><summary>Lessons in this module · {lessons.filter(l=>module.ids.includes(l.id)).length}</summary>
          <div className="lesson-list">
            {lessons
              .filter((l) => module.ids.includes(l.id) && matches(l))
              .map((l) => (
                <button
                  key={l.id}
                  onClick={() => open(l)}
                  className={`lesson-row ${!canLearn(l.id,pro)?"locked-lesson":""}`}
                >
                  <span
                    className={
                      state.learning.completed.includes(l.id)
                        ? "lesson-dot done"
                        : "lesson-dot"
                    }
                  >
                    {!canLearn(l.id,pro)?<Lock size={16}/>:state.learning.completed.includes(l.id) ? (
                      <Check size={16} />
                    ) : (
                      <BookOpen size={16} />
                    )}
                  </span>
                  <span>
                    {l.title}
                    <small>{canLearn(l.id,pro)?"Presentation + quiz · +35 XP on first completion":"Sprout Pro · Locked lesson"}</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
          </div></details>
        </section>
      ))}
      {!pro&&<section className="card pro-lock"><h3>Keep learning with Sprout Pro</h3><p>Unlock the full trading and personal finance curriculum.</p><button className="primary" onClick={()=>upgrade("All modules and lessons")}>Explore Pro · $10/month</button></section>}
      {!search&&moduleLimit<matchingModules.length&&<button className="secondary full" onClick={()=>setModuleLimit(modules.length)}>Show all modules ({shownModules.length} of {matchingModules.length})</button>}
      </>}
      {active && canLearn(active.id,pro) && <LessonPresentation key={`${active.id}-${moduleMode}`} title={moduleMode?activeTitle:undefined} group={activeGroup.length?activeGroup:[active]} moduleMode={moduleMode} state={state} update={update} onClose={()=>setActive(null)} onContinue={module=>{
        const moduleIndex=modules.findIndex(m=>m.ids.includes(active.id));
        const ids=pro?beginnerLearningOrder:starterLessonIds;
        const next=module?lessons.find(l=>l.id===modules[moduleIndex+1]?.ids[0]):lessons.find(l=>l.id===ids[ids.indexOf(active.id)+1]);
        if(next)open(next,followingPath,module);else setActive(null);
      }}/>}
    </>
  );
}
