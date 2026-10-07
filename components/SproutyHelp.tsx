"use client";
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {X,Send,ArrowUpRight,MessageCircle,RotateCcw} from 'lucide-react';
import {useAccount} from '@/lib/storage/useAccount';
import {useSubscription} from "./Subscription";
import {performance} from "@/lib/trading/analytics";
import {answerHelp,type HelpLink} from '@/lib/support/answers';
interface Message {role:'user'|'assistant';text:string;links?:HelpLink[];}
const welcome:Message={role:'assistant',text:'Let’s break this down together. I can help with Sprout, trading concepts, and personal finance. What would you like to understand?'};
export default function SproutyHelp(){
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[messages,setMessages]=useState<Message[]>([welcome]),[busy,setBusy]=useState(false),[mode,setMode]=useState('library');
 const input=useRef<HTMLInputElement>(null),launcher=useRef<HTMLButtonElement>(null),log=useRef<HTMLDivElement>(null);
 const {pro,upgrade}=useSubscription();
 const {state,update,pending}=useAccount();const router=useRouter();
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[messages,open]);
 useEffect(()=>{if(!open)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);launcher.current?.focus();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[open]);
 async function ask(text:string){const value=text.trim().slice(0,1000);if(!value||busy)return;const previous=messages.filter(m=>m.role==='assistant').at(-1)?.links?.find(l=>l.href.includes('lesson='))?.href.match(/lesson=(\d+)/)?.[1];setBusy(true);setMessages(current=>[...current,{role:'user',text:value}].slice(-30) as Message[]);setQuestion('');
 let answer=answerHelp(value,previous?Number(previous):undefined);
 try{const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:value,previousLesson:previous?Number(previous):undefined,history:messages.slice(-6).map(m=>({role:m.role,text:m.text}))}),signal:AbortSignal.timeout(50000)});if(response.ok){const data=await response.json();if(typeof data.text==='string'&&Array.isArray(data.links)){answer=data;setMode(data.mode);}}}catch{setMode('library');}
 setMessages(current=>[...current,{role:'assistant',...answer}].slice(-30) as Message[]);setBusy(false);input.current?.focus();}
 async function navigate(link:HelpLink){
  if(link.href.startsWith('#')){setOpen(false);document.querySelector(link.href)?.scrollIntoView({block:'center'});document.querySelector<HTMLInputElement>(`${link.href} input`)?.focus();return;}
  if(!state||pending)return;
  if(!state.profile.onboarded){const saved=await update({...state,profile:{...state.profile,onboarded:true}});if(!saved)return;}
  router.push(link.href);setOpen(false);
 }
 return <div className="sprouty-help">
 {open&&<section className="sprouty-help-panel" id="sprouty-help-panel" role="dialog" aria-label="Sprouty help chat"><header><Image src="/mascot/sprouty-minimal.png" width={42} height={42} alt=""/><div><h2>Sprouty</h2><span><i/>Automated help · Available 24/7</span></div><button className="icon-button" aria-label="Start a new Sprouty conversation" disabled={busy} onClick={()=>{setMessages([welcome]);setQuestion('');input.current?.focus();}}><RotateCcw size={17}/></button><button className="icon-button" aria-label="Close Sprouty help" onClick={()=>{setOpen(false);launcher.current?.focus();}}><X size={20}/></button></header>
 <div className="sprouty-help-log" ref={log} role="log" aria-label="Sprouty conversation" aria-live="polite" aria-relevant="additions">{messages.map((m,i)=><article className={`help-message ${m.role}`} key={i}><span className="help-speaker">{m.role==='user'?'You':'Sprouty'}</span><p>{m.text}</p>{m.links?.map(link=>link.href.startsWith('https://')?<a className="help-source" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={14}/></a>:<button className="help-source" key={link.href} disabled={!link.href.startsWith('#')&&(!state||pending)} onClick={()=>void navigate(link)}>{link.label}<ArrowUpRight size={14}/></button>)}</article>)}{busy&&<p role="status">Sprouty is looking into your question…</p>}</div>
 {messages.length===1&&<div className="help-prompts">{['How much money do I need to start?','How do I place a trade?','What is Sprout Pro?','What is a candlestick?'].map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div>}
 <button className="help-source" onClick={()=>{if(!pro){upgrade("Sprouty’s personal practice review");return;}if(!state)return;const stats=performance(state);setMessages(current=>[...current,{role:"assistant",text:`You’ve completed ${state.learning.completed.length} lessons and made ${state.trades.length} practice trades. ${stats.closed?`Your win rate across non-breakeven sell fills is ${stats.winRate===null?"not available":`${stats.winRate.toFixed(1)}%`}.`:"Close a practice position to begin reviewing realized results."} ${(state.journal?.length??0)<state.trades.length?"Your next step: write down the plan and possible loss for a recent trade.":"Your next step: review a chart scenario and explain what would invalidate your idea."} These are learning prompts, not stock recommendations.`,links:[{label:"Review your practice",href:"/practice"}]}]);}}>Review my practice · Pro</button>
 <form onSubmit={e=>{e.preventDefault();ask(question);}}><label className="sr-only" htmlFor="sprouty-question">Ask Sprouty a question</label><input ref={input} id="sprouty-question" value={question} maxLength={1000} onChange={e=>setQuestion(e.target.value)} placeholder="Ask Sprouty a question…" autoComplete="off"/><button className="primary" type="submit" aria-label="Send question to Sprouty" disabled={busy||!question.trim()}><Send size={17}/></button></form><p className="help-note">{mode==='ai'?'AI answers can use web sources. Check important information against the linked sources.':'Answers from Sprout’s help library. Web answers are available once AI is connected.'} Automated guidance, not a live agent or personal financial advice.</p></section>}
 <button ref={launcher} className="sprouty-help-launcher" aria-label={open?'Close Sprouty help':'Ask Sprouty'} aria-expanded={open} aria-controls="sprouty-help-panel" onClick={()=>setOpen(!open)}><Image src="/mascot/sprouty-minimal.png" width={38} height={38} alt=""/><span>{open?'Close':'Ask Sprouty'}</span>{open?<X size={17}/>:<MessageCircle size={17}/>}</button>
 </div>;
}
