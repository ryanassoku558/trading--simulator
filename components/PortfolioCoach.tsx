"use client";
import Link from 'next/link';
import type {State} from '@/types';
import {stocks} from '@/lib/market';
import Sprouty from './Sprouty';
export default function PortfolioCoach({state}:{state:State}){
 const research=state.learning.completed.some(id=>id>=140&&id<=143);
 const candidates=research?[['MSFT','Compare a technology business’s revenue, earnings, and valuation.'],['JNJ','Compare a healthcare company with a technology business.'],['SPY','Compare individual stocks with a fund holding many companies.']]:[['SPY','Explore a broad US stock ETF and compare it with a single company.'],['AAPL','Practice researching a familiar business before deciding whether to buy.'],['VTI','Explore broad stock exposure and compare fund holdings and fees.']];
 const held=new Set(state.holdings.map(h=>h.ticker));
 const available=candidates.filter(([symbol])=>stocks.some(s=>s.ticker===symbol)&&!held.has(symbol));
 return <section className="card portfolio-coach"><Sprouty compact completed={state.learning.completed.length} title="Here’s what I’d explore next." message="These are learning suggestions for your virtual portfolio. Research the business or fund, compare concentration, and define your risk before placing a practice trade."/><div className="coach-candidates">{available.length?available.map(([symbol,reason])=><Link className="example" href={`/market/${symbol}`} key={symbol}><strong>{symbol}</strong><p>{reason}</p><span>Research & practice →</span></Link>):<p>You already hold these examples. Review their combined concentration before adding more.</p>}</div><p className="small">Educational examples, not predictions or personalized investment advice. Prices here are simulated. Holding overlapping ETFs may not add diversification.</p></section>;
}
