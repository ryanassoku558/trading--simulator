import {useId} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowDownRight,Wallet,ArrowRight,ShieldCheck} from 'lucide-react';
import {portfolio} from '@/lib/trading';
import {money} from '@/lib/market';
import type {State} from '@/types';

/** Charts saved account values only; an unfunded history remains a flat baseline. */
export default function PortfolioOverview({state}:{state:State}) {
 const account=portfolio(state),gradient=useId().replaceAll(':',''),values=[...state.snapshots.map(s=>s.value),account.value];
 const sampled=values.length>80?values.filter((_,i)=>i===values.length-1||i%Math.ceil(values.length/79)===0):values;
 const low=Math.min(...sampled),high=Math.max(...sampled),span=Math.max(high-low,Math.max(high,1)*.015);
 const points=sampled.map((value,i)=>[i/(sampled.length-1)*600,105-(value-low)/span*75] as const),line=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '),area=`${line} L600,140 L0,140 Z`,ReturnIcon=account.gain<0?ArrowDownRight:ArrowUpRight;
 return <section className="product-portfolio" aria-label="Your virtual portfolio"><header><span className="product-account-label"><Wallet size={16}/> YOUR VIRTUAL PORTFOLIO</span><span className="product-practice-pill"><ShieldCheck size={13}/> Practice account</span></header><div className="product-account-value"><h2>{money(account.value)}</h2><span className={account.gain<0?'product-return negative-return':'product-return'}><ReturnIcon size={15}/>{account.percent>=0?'+':''}{account.percent.toFixed(2)}%<small>since funding</small></span></div><figure className="product-equity-chart"><svg viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#82e4b4" stopOpacity=".3"/><stop offset="100%" stopColor="#82e4b4" stopOpacity="0"/></linearGradient></defs><path d={area} fill={`url(#${gradient})`}/><path d="M0,35H600 M0,70H600 M0,105H600" stroke="#ffffff12" strokeWidth="1"/><path d={line} fill="none" stroke="#8de6ba" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/><circle cx="600" cy={points.at(-1)![1]} r="4" fill="#a4f5ce"/></svg><figcaption>{state.trades.length?'Saved practice activity · Current value at simulated prices':'Your first practice trade starts your portfolio story.'}</figcaption></figure><dl className="product-account-breakdown"><div><dt>Available cash</dt><dd>{money(state.cash)}</dd></div><div><dt>Invested value</dt><dd>{money(account.invested)}</dd></div><div><dt>Open positions</dt><dd>{state.holdings.length.toString().padStart(2,'0')}</dd></div></dl><footer><Link href="/portfolio">View portfolio <ArrowRight size={15}/></Link><Link href={state.trades.length===0?"/market/AAPL?guided=1":"/market"}>Open Simulator <ArrowUpRight size={15}/></Link></footer></section>;
}
