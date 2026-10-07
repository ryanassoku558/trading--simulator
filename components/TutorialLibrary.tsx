"use client";
import {useState} from "react";
import {Play, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import tutorials from "@/lib/education/tutorials.json";
import {useSubscription} from "./Subscription";
import {canLearn} from "@/lib/billing/access";
import Dialog from "./Dialog";
import TutorialVideo from "./TutorialVideo";
export default function TutorialLibrary(){
 const {pro,upgrade}=useSubscription();
 const [selected,setSelected]=useState<string|null>(null);
 const [showAll,setShowAll]=useState(false);
 return <section className="tutorial-library" id="tutorials">
  <div className="section-intro"><div><span className="eyebrow">SMALL VIDEOS. BIG FIRST STEPS.</span><h2>See it. Understand it. Try it.</h2><p>Short visual explainers for trading basics, research, risk, and everyday money decisions.</p></div><span className="video-count">{tutorials.length} videos · voice & captions</span></div>
  <div className="tutorial-grid">{(showAll?tutorials:tutorials.slice(0,6)).map(t=><button className="tutorial-card" aria-label={`Play ${t.slug === "stocks" ? "stock ownership" : t.slug === "orders" ? "order types" : t.slug} video`} key={t.slug} onClick={()=>canLearn(t.lessonIds[0],pro)?setSelected(t.slug):upgrade("This video tutorial")}><div className={`tutorial-cover tutorial-${t.slug}`}><span className="tutorial-topic">{canLearn(t.lessonIds[0],pro)?"SPROUT TUTORIALS":"SPROUT PRO · LOCKED"}</span><span className="tutorial-play"><Play size={23} fill="currentColor"/></span><span className="tutorial-duration">{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</span></div><div><h3>{t.title}</h3><p>Watch the idea come to life <ArrowUpRight size={14}/></p></div></button>)}</div>
  {tutorials.length>6&&<button className="secondary" onClick={()=>setShowAll(!showAll)}>{showAll?"Show fewer tutorials":`See all ${tutorials.length} tutorials`}</button>}
  {selected && <Dialog title={tutorials.find(t=>t.slug===selected)!.title} onClose={()=>setSelected(null)}><TutorialVideo slug={selected}/><Link className="primary full" href={`/learn?lesson=${tutorials.find(t=>t.slug===selected)!.lessonIds[0]}`} onClick={()=>setSelected(null)}>Explore the full lesson <ArrowUpRight size={16}/></Link></Dialog>}
 </section>;
}
