"use client";
import {useState} from 'react';
import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
const tips=["Charts aren’t scary—let’s look at one together.","Small steps count. Take one lesson at your own pace.","A good plan includes what you’ll do if the idea fails.","Pause before a trade: what’s your size and possible loss?"];
export default function Sprouty({completed=0}:{completed?:number}){const [tip,setTip]=useState(-1);return <aside className="sprouty-card" aria-label="Sprouty learning companion"><Image src="/mascot/sprouty.png" width={144} height={144} alt="Sprouty, a smiling little green seedling with two leaves"/><div><span className="eyebrow">MEET SPROUTY</span><h3>{completed>0?'You’re blooming! Keep going.':'Let’s grow your trading skills together.'}</h3><p aria-live="polite">{tip>=0?tips[tip]:completed>0?`${completed} lessons completed. Your next small step is waiting.`:'I’m your friendly guide. One chart, one lesson, one practice decision at a time.'}</p><button className="text-link" onClick={()=>setTip((tip+1)%tips.length)}>A little encouragement <ArrowRight size={14}/></button></div></aside>}
