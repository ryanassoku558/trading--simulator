"use client";
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import LiveGame from './LiveGame';
import StudyCoach from './StudyCoach';
import FinancialVisual from '../academy/FinancialVisual';
import {Layers3,Gamepad2,ArrowUpRight} from 'lucide-react';
export default function PlayAndStudy({onSignIn}:{onSignIn:()=>void}){
 const params=useSearchParams(),initialRoom=params.get('room')||'';
 const [mode,setMode]=useState(initialRoom?'Live quiz':['Flashcards','Study cards'].includes(params.get('mode')||'')?'Flashcards':params.get('mode')==='Live quiz'?'Live quiz':'Choose');
 return <div className="play-study academy-study-hub">{mode==='Choose'?<div className="studio-intro"><div><span className="eyebrow">YOUR KNOWLEDGE. IN MOTION.</span><h1>A smarter way<br/>to make it stick.</h1><p>Build financial confidence one concept at a time. Flip through a deck, challenge your friends, and bring what you learn into the market.</p><Link className="text-link" href="/learn?view=Modules">Explore the full learning journey <ArrowUpRight size={17}/></Link></div><div className="studio-intro-mark"><Layers3 size={44}/><span>Learn it.<br/>Recall it.<br/>Use it.</span></div></div>:<div className="study-mode-heading"><h1>Play & study</h1><p>{mode==='Flashcards'?'Your space to focus, flip and remember.':'Create a shared learning moment.'}</p></div>}
 <div className="learning-sections studio-mode-tabs" role="group" aria-label="Play and study modes">{['Choose','Flashcards','Live quiz'].map(m=><button key={m} aria-pressed={mode===m} onClick={()=>setMode(m)}>{m==='Choose'?'Explore modes':m}</button>)}</div>
 {mode==='Choose'&&<div className="play-mode-cards studio-mode-cards">{[{title:'Flashcards',icon:Layers3,copy:'Big cards. Clear definitions. A focused way to turn unfamiliar financial ideas into knowledge you can recall.',action:'Start flipping',variant:'cards' as const},{title:'Live quiz',icon:Gamepad2,copy:'Bring the room together. Build a quiz from any lesson, invite players by code, and learn through every reveal.',action:'Host or join a game',variant:'live' as const}].map(m=><section className="studio-mode-card" key={m.title}><FinancialVisual variant={m.variant}/><div><span className="eyebrow">{m.title==='Flashcards'?'AT YOUR OWN PACE':'BETTER TOGETHER'}</span><h2><m.icon size={25}/>{m.title}</h2><p>{m.copy}</p><button className="primary" onClick={()=>setMode(m.title)}>{m.action} <ArrowUpRight size={17}/></button></div></section>)}</div>}
 {mode==='Flashcards'&&<StudyCoach/>}{mode==='Live quiz'&&<LiveGame initialRoom={initialRoom} onSignIn={onSignIn}/>}
 </div>;
}
