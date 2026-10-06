"use client";
import {useState} from "react";
import Link from "next/link";
import type {State,Trade} from "@/types";
import {money} from "@/lib/market";
import {performance} from "@/lib/trading/analytics";
import {portfolio} from "@/lib/trading";
import ChartPractice from "../ChartPractice";
import {Trophy,NotebookPen,ArrowUpRight} from "lucide-react";
function JournalEditor({trade,state,update}: {trade:Trade;state:State;update:(s:State)=>void}){
 const existing=state.journal?.find(j=>j.tradeId===trade.id);
 const [note,setNote]=useState(existing?.note??""),[emotion,setEmotion]=useState(existing?.emotion??"Calm"),[risk,setRisk]=useState(existing?.initialRisk?.toString()??"");
 const validRisk=risk===""||(Number.isFinite(Number(risk))&&Number(risk)>0);
 const saved=existing?.note===note&&existing?.emotion===emotion&&(existing?.initialRisk??undefined)===(risk?Number(risk):undefined);
 return <form className="journal-editor" onSubmit={e=>{e.preventDefault();if(!validRisk)return;update({...state,journal:[...(state.journal??[]).filter(j=>j.tradeId!==trade.id),{tradeId:trade.id,note:note.trim(),emotion,initialRisk:risk?Number(risk):undefined}]});}}>
  <div className="journal-trade"><strong>{trade.side.toUpperCase()} {trade.shares} {trade.ticker}</strong><span>{money(trade.price)} / share · {new Date(trade.date).toLocaleDateString()}</span></div>
  <label>What was your plan, and what did you learn?<textarea aria-label="Trade journal note" value={note} maxLength={4000} rows={4} onChange={e=>setNote(e.target.value)} placeholder="Why did I take this trade? What would invalidate my idea? What can I learn from the result?"/></label>
  <div className="journal-fields"><label>How did you feel?<select aria-label="Trading emotion" value={emotion} onChange={e=>setEmotion(e.target.value)}>{["Calm","Confident","Uncertain","FOMO","Frustrated"].map(e=><option key={e}>{e}</option>)}</select></label>{trade.side==="sell"&&<label>Initial risk for the shares closed ($)<input aria-label="Initial trade risk" type="number" min="0.01" step="0.01" value={risk} onChange={e=>setRisk(e.target.value)} placeholder="Optional"/></label>}</div>
  {trade.side==="sell"&&<small>Use the risk you planned at entry for only the shares sold here. R = realized profit or loss ÷ that initial risk. It is user-reported, not a guaranteed loss limit.</small>}
  {!validRisk&&<p role="alert">Enter a positive risk amount or leave it blank.</p>}
  <button className="primary" disabled={!note.trim()||!validRisk||saved} type="submit">{saved?"Journal saved":"Save journal entry"}</button>
 </form>;
}
export default function Practice({state,update}: {state:State;update:(s:State)=>void}){
 const [selected,setSelected]=useState("");
 const trade=state.trades.find(t=>t.id===selected)??state.trades[0];
 const stats=performance(state),challenge=state.challenge;
 const recent=challenge?state.trades.slice(0,Math.max(0,state.trades.length-challenge.startTradeCount)):[];
 const reviewed=recent.filter(t=>state.journal?.some(j=>j.tradeId===t.id&&j.note.trim()));
 const days=new Set(reviewed.map(t=>t.date.slice(0,10))).size;
 const target=challenge?.id==="seven-days"?7:3,progress=challenge?.id==="seven-days"?days:reviewed.length;
 const start=(id:string)=>update({...state,challenge:{id,startedAt:new Date().toISOString(),startingEquity:portfolio(state).value,startTradeCount:state.trades.length}});
 return <><div className="page-heading"><div><span className="eyebrow">TURN PRACTICE INTO UNDERSTANDING</span><h1>Your practice lab</h1><p>Replay a chart, reflect on a trade, and measure the process.</p></div><Link className="primary" href="/market">Open simulator <ArrowUpRight size={17}/></Link></div>
  <ChartPractice/>
  <section className="card practice-challenges"><div className="card-heading"><div><span className="eyebrow">SMALL GOALS. THOUGHTFUL HABITS.</span><h2>Practice challenges</h2></div><Trophy size={24}/></div>
   <p>Build a repeatable learning process. There is no promised return or pressure to trade every day.</p>
   <div className="challenge-grid"><div><h3>Plan & review 3 trades</h3><p>Make three virtual trades and journal each decision. Review the reason, size, and possible loss.</p><button className="secondary" disabled={challenge?.id==="plan-3"} onClick={()=>start("plan-3")}>{challenge?.id==="plan-3"?"Active challenge":"Start three-trade challenge"}</button></div><div><h3>7 days of reflection</h3><p>Review trades from seven distinct days, at your own pace. Learning consistency matters more than chasing a return target.</p><button className="secondary" disabled={challenge?.id==="seven-days"} onClick={()=>start("seven-days")}>{challenge?.id==="seven-days"?"Active challenge":"Start reflection challenge"}</button></div></div>
   {challenge&&<div className="challenge-progress"><label htmlFor="challenge-progress">{challenge.id==="seven-days"?"Days reflected":"Trades reviewed"}: {Math.min(progress,target)} / {target}</label><progress id="challenge-progress" max={target} value={Math.min(progress,target)}/><small>{progress>=target?"Challenge complete. Review what you learned before starting another.":"Only trades made after starting the challenge count. Starting another challenge replaces this one."}</small></div>}
  </section>
  <section className="card" id="performance"><div className="card-heading"><div><span className="eyebrow">LEARN FROM YOUR RESULTS</span><h2>Performance analytics</h2></div></div><div className="analytics-grid"><div><span>Win rate</span><strong>{stats.winRate===null?"—":`${stats.winRate.toFixed(1)}%`}</strong><small>{stats.closed} sell fills · {stats.breakeven} breakeven excluded</small></div><div><span>Average R</span><strong>{stats.averageR===null?"—":`${stats.averageR.toFixed(2)}R`}</strong><small>{stats.rCount} sell fills with recorded initial risk</small></div><div><span>Max drawdown</span><strong>{stats.maxDrawdown.toFixed(2)}%</strong><small>From sampled equity peaks</small></div><div><span>Realized profit / loss</span><strong className={stats.realized>=0?"positive":"negative"}>{money(stats.realized)}</strong><small>Closed shares only</small></div></div><p className="small">Win rate counts profitable versus losing sell fills, including partial exits, rather than complete round trips. Drawdown uses saved snapshots and current equity; it may miss price changes between snapshots. Average R uses the initial risk you record in your journal.</p></section>
  <section className="card" id="journal"><div className="card-heading"><div><span className="eyebrow">YOUR EDGE IS SELF-AWARENESS</span><h2>Trade journal</h2><p>Notes stay with your practice account, locally or in your signed-in cloud account.</p></div><NotebookPen size={25}/></div>{trade?<><label className="journal-select">Choose a trade<select aria-label="Journal trade" value={trade.id} onChange={e=>setSelected(e.target.value)}>{state.trades.map(t=><option key={t.id} value={t.id}>{t.side.toUpperCase()} {t.ticker} · {new Date(t.date).toLocaleString()}</option>)}</select></label><JournalEditor key={trade.id} trade={trade} state={state} update={update}/></>:<div className="journal-empty"><NotebookPen size={30}/><h3>Your next trade has a story.</h3><p>Make a virtual trade, then come back to record the plan and what you learned.</p><Link href="/market" className="text-link">Explore the simulator →</Link></div>}</section>
 </>;
}
