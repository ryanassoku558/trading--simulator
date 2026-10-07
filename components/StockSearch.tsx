"use client";
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Search} from 'lucide-react';
import {stocks} from '@/lib/market';
export default function StockSearch({initialQuery=''}:{initialQuery?:string}){
 const [query,setQuery]=useState(initialQuery);const router=useRouter();const value=query.trim();const exact=stocks.find(s=>s.ticker===value.toUpperCase());const results=value?(exact?[exact]:stocks.filter(s=>`${s.ticker} ${s.company}`.toLowerCase().includes(value.toLowerCase())).slice(0,8)):[];
 function select(ticker:string){setQuery('');router.push(`/market?symbol=${encodeURIComponent(ticker)}`);}
 return <div className="chart-stock-search"><form role="search" onSubmit={e=>{e.preventDefault();if(exact)select(exact.ticker);}}><label className="search"><Search size={19}/><input aria-label="Search stocks" placeholder="Search a stock or ETF by ticker or company…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setQuery('');}} autoComplete="off"/></label></form>{value&&<div className="stock-search-results" aria-label="Stock search results">{results.length?results.map(s=><button type="button" key={s.ticker} onClick={()=>select(s.ticker)}><strong>{s.ticker}</strong><span>{s.company}</span><small>{s.assetType}</small></button>):<p>No matching stock or ETF. Try another ticker.</p>}</div>}</div>;
}
