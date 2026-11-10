"use client";
import {useState} from 'react';
const examples=[
 {title:'Sweep and reclaim',level:'Prior low $100',path:'M25 50L80 70L125 100L180 85L225 155L255 125L300 100L350 85L395 90',line:130,note:'Price crosses below a reference low and returns. That observation alone does not prove why it happened or guarantee a bounce.'},
 {title:'Opening-range break and retest',level:'Range high $51',path:'M25 150L65 120L110 140L150 110L195 125L230 70L265 90L305 55L350 65L395 40',line:100,note:'The break and retest describe a possible setup. Compare the next resistance, stop distance, spread, and costs before considering an entry.'},
 {title:'Trend pullback and VWAP reference',level:'Illustrative VWAP $80',path:'M25 145L70 115L115 130L160 85L205 100L250 65L290 95L335 70L395 50',line:105,note:'An upward sequence can still fail. VWAP and moving averages summarize data; they do not forecast a guaranteed continuation.'},
 {title:'Equity drawdown review',level:'Prior equity peak',path:'M25 140L70 120L110 130L155 80L200 60L245 95L285 120L330 105L370 80L395 90',line:60,note:'This illustrative equity curve includes a decline from its peak. Evaluate costs and losses across complete records, not just selected wins.'}
];
export default function StrategyLessonChart({lessonId}:{lessonId:number}){
 const [details,setDetails]=useState(false);const index=Math.floor((lessonId-152)/4);if(index<0||index>=examples.length)return null;const example=examples[index];
 return <figure className="scenario-chart"><svg viewBox="0 0 420 210" role="img" aria-label={`${example.title}: illustrative educational chart`}><path d={example.path} fill="none" stroke="var(--green)" strokeWidth="4"/><path d={`M20 ${example.line}H400`} stroke="#bb8533" strokeWidth="2" strokeDasharray="6 5"/><text x="22" y="24" fill="currentColor">{example.title}</text><text x="22" y="185" fill="currentColor">{example.level} · illustrative, not market data</text></svg><button type="button" className="secondary" aria-expanded={details} onClick={()=>setDetails(!details)}>{details?'Hide setup review':'Review the setup'}</button>{details&&<figcaption>{example.note} Define confirmation, invalidation, and affordable risk; choosing no trade is valid.</figcaption>}</figure>;
}
