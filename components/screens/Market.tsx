"use client";
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import type {State,Trade} from '@/types';
import {stocks,quote} from '@/lib/market';
import {PracticeGoals} from '../LearningRetention';
import StockSearch from '../StockSearch';
import RealMarketQuotes from '../RealMarketQuotes';
import Research from './Research';
import StockDetail from './StockDetail';
export default function Market({state,advance,watch,update,onTrade}:{state:State;advance:()=>void;watch:(ticker:string)=>void;update:(state:State)=>void;onTrade:(trade:Trade)=>void}){
 const params=useSearchParams();const [view,setView]=useState(params.get('view')==='research'?'research':'practice');const requested=params.get('symbol')||params.get('q')||'AAPL';const selected=stocks.find(s=>s.ticker===requested.toUpperCase())??stocks.find(s=>s.ticker==='AAPL')!;
 const initialQuery=params.get('q')&&!stocks.some(s=>s.ticker===params.get('q')?.toUpperCase())?params.get('q')! :'';
 return <><div className="market-discovery-toolbar"><div className="chart-type-buttons market-source-switch" role="group" aria-label="Market data view"><button aria-pressed={view==='practice'} onClick={()=>setView('practice')}>Virtual trading simulator</button><button aria-pressed={view==='quotes'} onClick={()=>setView('quotes')}>Real market quotes</button><button aria-pressed={view==='research'} onClick={()=>setView('research')}>Company research</button></div>{view==='practice'&&<StockSearch initialQuery={initialQuery}/>}</div>{view==='research'?<Research initialSymbol={selected.ticker} watched={state.watchlist} onWatch={watch}/>:view==='quotes'?<RealMarketQuotes/>:<><StockDetail key={selected.ticker} state={state} ticker={selected.ticker} current={quote(selected.ticker,state.tick)} advance={advance} watch={watch} update={update} onTrade={onTrade} guided={params.get("guided")==="1"}/><details className="card ds-simulator-context"><summary>New to the simulator? Tutorial & practice goals</summary><p>Use virtual money to practice a decision. Search a symbol, open Sprouty’s chart tour, and review your order before placing it.</p><PracticeGoals state={state}/></details></>}</>;
}
