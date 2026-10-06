"use client";
import {useState} from "react";
import {Play, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import tutorials from "@/lib/education/tutorials.json";
import Dialog from "./Dialog";
import TutorialVideo from "./TutorialVideo";
export default function TutorialLibrary(){
 const [selected,setSelected]=useState<string|null>(null);
 return <section className="tutorial-library" id="tutorials">
  <div className="section-intro"><div><span className="eyebrow">SMALL VIDEOS. BIG FIRST STEPS.</span><h2>See it. Understand it. Try it.</h2><p>Four visual explainers to turn unfamiliar words into your next small step.</p></div><span className="video-count">4 videos · 30 seconds each</span></div>
  <div className="tutorial-grid">{tutorials.map(t=><button className="tutorial-card" aria-label={`Play ${t.slug === "stocks" ? "stock ownership" : t.slug === "orders" ? "order types" : t.slug} video`} key={t.slug} onClick={()=>setSelected(t.slug)}><div className={`tutorial-cover tutorial-${t.slug}`}><span className="tutorial-topic">SPROUT STARTERS</span><span className="tutorial-play"><Play size={23} fill="currentColor"/></span><span className="tutorial-duration">0:30</span></div><div><h3>{t.title}</h3><p>Watch the idea come to life <ArrowUpRight size={14}/></p></div></button>)}</div>
  {selected && <Dialog title={tutorials.find(t=>t.slug===selected)!.title} onClose={()=>setSelected(null)}><TutorialVideo slug={selected}/><Link className="primary full" href={`/learn?lesson=${tutorials.find(t=>t.slug===selected)!.lessonIds[0]}`} onClick={()=>setSelected(null)}>Explore the full lesson <ArrowUpRight size={16}/></Link></Dialog>}
 </section>;
}
