"use client";
import {canWatchTutorial} from "@/lib/billing/benefits";
import {useSubscription,ProGate} from "./Subscription";
import tutorials from "@/lib/education/tutorials.json";
export default function TutorialVideo({slug}: {slug:string}) {
 const {pro}=useSubscription();
 if(!canWatchTutorial(slug,pro))return <ProGate feature="This video tutorial">{null}</ProGate>;
 const tutorial=tutorials.find(t=>t.slug===slug);
 if(!tutorial)return null;
 return <section className="tutorial-player" aria-label={`${tutorial.title} video tutorial`}>
   <div className="tutorial-heading"><span className="eyebrow">WATCH & LEARN</span><span>{tutorial.duration} sec · narrated · captions</span></div>
   <video controls playsInline preload="none" poster={`/tutorials/${slug}.webp`} aria-label={tutorial.title}>
     <source src={`/tutorials/${slug}.mp4?v=${tutorial.narrationVersion}`} type="video/mp4"/>
     <track kind="captions" src={`/tutorials/${slug}.vtt?v=${tutorial.narrationVersion}`} srcLang="en" label="English" default/>
     Your browser does not support video. Read the transcript below.
   </video>
   <details><summary>Read video transcript</summary>{tutorial.scenes.map(s=><p key={s.title}><strong>{s.title}.</strong> {s.caption}</p>)}</details>
 </section>;
}
