"use client";
import {useState} from 'react';
import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import {lessons} from '@/lib/education';
const tips=["Let’s break this down together. Start with what the chart shows, rather than what you hope happens next.","Here’s what I’d look for next: an entry condition, a position size, and a clear reason to exit.","A useful review considers both the outcome and whether you followed your plan.","Take your time. Passing on a trade is also a decision."];
export default function Sprouty({completed=0,title,message,compact=false}:{completed?:number;title?:string;message?:string;compact?:boolean}){
 const [tip,setTip]=useState(-1);
 const stage=completed===0?0:completed<10?1:completed<30?2:3;
 const stages=['Seedling','Taking root','Growing','Established'];
 return <aside className={`sprouty-card ${compact?'sprouty-compact':''}`} aria-label="Sprouty learning companion">
  <div className="sprouty-plant" data-stage={stage}><Image src="/mascot/sprouty-minimal.png" width={144} height={144} alt={`Sprouty, a minimal green leaf with two calm eyes. Growth stage: ${stages[stage]}.`}/></div>
  <div><span className="eyebrow">SPROUTY · {stages[stage].toUpperCase()}</span><h3>{title??(completed>0?'You’re improving. Keep going.':'Let’s break this down together.')}</h3><p aria-live="polite">{tip>=0?tips[tip]:message??(completed>0?`${completed} of ${lessons.length} lessons completed. Your understanding grows with each step.`:'Build understanding one lesson at a time. Start with the basics, then put them into practice.')}</p>{!compact&&<button className="text-link" onClick={()=>setTip((tip+1)%tips.length)}>Next perspective <ArrowRight size={14}/></button>}</div>
 </aside>;
}
