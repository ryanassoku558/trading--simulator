"use client";
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import LiveGame from './LiveGame';
import PracticeQuest from './PracticeQuest';
import StudyCoach from './StudyCoach';
import {Layers3,Gamepad2,Sparkles,ArrowUpRight} from 'lucide-react';
import GlossaryPractice from '../GlossaryPractice';
export default function PlayAndStudy({onSignIn}:{onSignIn:()=>void}){
 const params=useSearchParams(),initialRoom=params.get('room')||'';
 const [mode,setMode]=useState(initialRoom?'Live quiz':['Practice quest','Study cards','Live quiz'].includes(params.get('mode')||'')?params.get('mode')!:'Choose');
 return <div className="play-study academy-study-hub"><div className="page-heading"><div><span className="eyebrow">YOUR PERSONAL STUDY STUDIO</span><h1>Play & study</h1><p>Learning can be a small adventure. Start on your own, study a few words, or join friends in a live quiz.</p></div><Link className="secondary" href="/dashboard">Back to Home</Link></div>
 <div className="learning-sections" role="group" aria-label="Play and study modes">{['Choose','Practice quest','Study cards','Live quiz'].map(m=><button key={m} aria-pressed={mode===m} onClick={()=>setMode(m)}>{m}</button>)}</div>
 {mode==='Choose'&&<div className="play-mode-cards">{[{title:'Practice quest',icon:Sparkles,copy:'Play a five-question round on your own. No timer, just helpful explanations.',action:'Play on my own'},{title:'Study cards',icon:Layers3,copy:'Learn six useful words, check what you remember, and revisit the tricky ones.',action:'Learn some words'},{title:'Live quiz',icon:Gamepad2,copy:'Host with a Sprout account, or join a friend’s room with a code. No account needed to join.',action:'Host or join a game'}].map(m=><section className="card" key={m.title}><div className="study-mode-cover"><span className="study-cover-shape"/><m.icon size={44} strokeWidth={1.5}/><span className="study-cover-caption">{m.title==='Live quiz'?'TOGETHER IS BETTER':m.title==='Study cards'?'MAKE KNOWLEDGE STICK':'SMALL WINS. REAL PROGRESS.'}</span></div><h2>{m.title}</h2><p>{m.copy}</p><button className="primary" onClick={()=>setMode(m.title)}>{m.action} <ArrowUpRight size={16}/></button></section>)}</div>}
 {mode==='Practice quest'&&<PracticeQuest/>}
 {mode==='Study cards'&&<><StudyCoach/><details className="card study-extra"><summary>More ways to study: flashcards, matching & definition quizzes</summary><GlossaryPractice/></details></>}
 {mode==='Live quiz'&&<LiveGame initialRoom={initialRoom} onSignIn={onSignIn}/>}
 <p className="small">New to trading? <Link className="text-link" href="/learn?lesson=1">Start with “What is a stock?” →</Link> Your original lessons, quizzes and progress are always available.</p></div>;
}
