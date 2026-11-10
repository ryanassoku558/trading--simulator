"use client";
import Image from 'next/image';
import {Check, Sparkles} from 'lucide-react';
import type {CSSProperties} from 'react';
const stages=['Seedling','Taking root','Growing','Established'];
export default function ModuleCelebration({completed,earned}:{completed:number;earned:number}){
 const stage=completed===0?0:completed<10?1:completed<30?2:3;
 return <div className="module-celebration" aria-label="Sprouty module celebration">
  <div className="celebration-scene" aria-hidden="true">
   <div className="celebration-halo"/><div className="celebration-ring"/>
   {Array.from({length:12},(_,i)=><span className="celebration-leaf" key={i} style={{'--leaf-angle':`${i*30}deg`,'--leaf-distance':`${88+(i%3)*17}px`,'--leaf-delay':`${i%4*70}ms`} as CSSProperties}/>)}
   <Image className="celebration-sprouty" src="/mascot/sprouty-minimal.png" width={160} height={160} alt="" priority/>
   <span className="celebration-check"><Check size={20}/></span>
  </div>
  <span className="eyebrow">SPROUTY · {stages[stage].toUpperCase()}</span>
  <h3>Look how far you’ve grown.</h3>
  <p>You finished this module. Your understanding is taking root—one thoughtful decision at a time.</p>
  <div className="celebration-reward" role="status"><Sparkles size={18}/>{earned>0?<strong>+{earned} XP earned</strong>:<strong>Knowledge refreshed</strong>}</div>
  <small>{completed} lessons completed · Your progress is saved</small>
 </div>;
}
