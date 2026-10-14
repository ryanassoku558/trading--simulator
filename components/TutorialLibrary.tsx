"use client";
import {useState} from "react";
import {Play, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import tutorials from "@/lib/education/tutorials.json";
import {useSubscription} from "./Subscription";
import {canWatchTutorial} from "@/lib/billing/benefits";
import Dialog from "./Dialog";
import TutorialVideo from "./TutorialVideo";
export default function TutorialLibrary(){
 const {pro,upgrade}=useSubscription();
 const [selected,setSelected]=useState<string|null>(null);
 const [page,setPage]=useState(0);
 return <section className="tutorial-library" id="tutorials">
  <div className="section-intro"><div><span className="eyebrow">SMALL VIDEOS. BIG FIRST STEPS.</span><h2>See it. Understand it. Try it.</h2><p>Short visual explainers for trading basics, research, risk, and everyday money decisions.</p></div><span className="video-count">{tutorials.length} videos · voice & captions</span></div>
  <div className="tutorial-grid">{tutorials.slice(page*4,page*4+4).map(t=><button className={`tutorial-card ${canWatchTutorial(t.slug,pro)?"":"locked-tutorial"}`} aria-label={`Play ${t.slug === "stocks" ? "stock ownership" : t.slug === "orders" ? "order types" : t.slug} video`} key={t.slug} onClick={()=>canWatchTutorial(t.slug,pro)?setSelected(t.slug):upgrade("This video tutorial")}><div className={`tutorial-cover tutorial-${t.slug}`}><span className="tutorial-topic">{canWatchTutorial(t.slug,pro)?"SPROUT TUTORIALS":"SPROUT PRO · LOCKED"}</span><span className="tutorial-play"><Play size={23} fill="currentColor"/></span><span className="tutorial-duration">{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</span></div><div><h3>{t.title}</h3><p>Watch the idea come to life <ArrowUpRight size={14}/></p></div></button>)}</div>
  <nav className="compact-pagination" aria-label="Tutorial pages"><button className="secondary" disabled={page===0} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page+1} of {Math.ceil(tutorials.length/4)}</span><button className="secondary" disabled={(page+1)*4>=tutorials.length} onClick={()=>setPage(page+1)}>Next</button></nav>
  {selected && <Dialog title={tutorials.find(t=>t.slug===selected)!.title} onClose={()=>setSelected(null)}><TutorialVideo slug={selected}/><Link className="primary full" href={`/learn?lesson=${tutorials.find(t=>t.slug===selected)!.lessonIds[0]}`} onClick={()=>setSelected(null)}>Explore the full lesson <ArrowUpRight size={16}/></Link></Dialog>}
 </section>;
}
