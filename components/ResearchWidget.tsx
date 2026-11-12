"use client";
import {useEffect,useRef,useState} from 'react';
const scripts={chart:'advanced-chart',news:'timeline',markets:'market-overview'} as const;
export default function ResearchWidget({kind,symbol='AAPL'}:{kind:keyof typeof scripts;symbol?:string}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  function load(){
   if(!element)return;setFailed(false);element.replaceChildren();const target=document.createElement('div');target.className='tradingview-widget-container__widget';element.appendChild(target);
   const dark=document.documentElement.dataset.theme==='dark';
   const common={colorTheme:dark?'dark':'light',locale:'en',width:'100%',height:560,isTransparent:false};
   const options=kind==='chart'?{...common,theme:dark?'dark':'light',symbol,interval:'D',timezone:'Etc/UTC',style:'1',allow_symbol_change:true,calendar:false,hide_side_toolbar:false,support_host:'https://www.tradingview.com'}:kind==='news'?{...common,feedMode:'symbol',symbol,displayMode:'regular'}:{...common,dateRange:'12M',showChart:true,showSymbolLogo:true,showFloatingTooltip:true,tabs:[{title:'Indices',symbols:[{s:'FOREXCOM:SPXUSD',d:'S&P 500'},{s:'FOREXCOM:NSXUSD',d:'Nasdaq 100'},{s:'FOREXCOM:DJI',d:'Dow Jones'}]},{title:'Rates & currencies',symbols:[{s:'TVC:US10Y',d:'US 10-year yield'},{s:'FX:EURUSD',d:'EUR / USD'},{s:'FX:GBPUSD',d:'GBP / USD'},{s:'FX:USDJPY',d:'USD / JPY'}]}]};
   const script=document.createElement('script');script.async=true;script.src=`https://s3.tradingview.com/external-embedding/embed-widget-${scripts[kind]}.js`;script.textContent=JSON.stringify(options);script.onerror=()=>setFailed(true);element.appendChild(script);
  }
  load();window.addEventListener('sprout-theme',load);return()=>{window.removeEventListener('sprout-theme',load);element.replaceChildren();};
 },[kind,symbol,attempt]);
 return <section className="research-widget"><p>External TradingView data. Check the widget’s symbol, timestamp and exchange delay. News links belong to their publishers. These data do not set paper-trading fills.</p><div ref={host} className="tradingview-widget-container" aria-label={`${kind} research from TradingView`}/>{failed&&<p role="status">The provider could not load. Use the source link below.</p>}<div className="research-actions"><a href={kind==='markets'?'https://www.tradingview.com/markets/':`https://www.tradingview.com/symbols/${encodeURIComponent(symbol)}/${kind==='news'?'news/':''}`} target="_blank" rel="noopener noreferrer">{kind==='news'?'News':'Market research'} by TradingView ↗</a><button className="secondary" onClick={()=>setAttempt(x=>x+1)}>Reload provider</button></div></section>;
}
