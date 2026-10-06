"use client";
import Link from "next/link";
import {useMemo, useState} from "react";
import {Pause, Play} from "lucide-react";
import {stocks, quote, money} from "@/lib/market";
export default function MarketTicker({tick}: {tick:number}) {
 const [paused,setPaused]=useState(false);
 const rankTick=Math.floor(tick/30)*30;
 const leaders=useMemo(()=>stocks.filter(s=>s.assetType === "Stock")
   .map(s=>quote(s.ticker,rankTick)).filter(s=>s.change>0)
   .sort((a,b)=>b.change-a.change || a.ticker.localeCompare(b.ticker)).slice(0,100),[rankTick]);
 function group(copy: boolean){return <div className="tape-group" aria-hidden={copy || undefined} inert={copy || undefined}>
  {leaders.map((s,i)=>{const q=quote(s.ticker,tick);return <Link href={`/market/${s.ticker}`} key={s.ticker} aria-label={`${s.ticker}, simulated price ${money(q.price)}, change ${q.change.toFixed(2)} percent`}><small className="tape-rank">{i+1}</small><strong>{s.ticker}</strong><span>{money(q.price)}</span><b className={q.change>=0?"positive":"negative"}>{q.change>=0?"+":""}{q.change.toFixed(2)}%</b></Link>;})}
 </div>;}
 return <div className={`market-tape scrolling-tape ${paused ? "is-paused" : ""}`} aria-label="Top 100 simulated stock gainers">
  <div className="tape-label"><span className="live-dot"/><strong>TOP MOVERS</strong><small>SIMULATED · 24H</small></div>
  <div className="tape-viewport"><div className="tape-track" style={{animationDuration:`${leaders.length*2.6}s`}}>{group(false)}{group(true)}</div></div>
  <button className="tape-pause" aria-label={`${paused?"Resume":"Pause"} stock ticker`} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>
 </div>;
}
