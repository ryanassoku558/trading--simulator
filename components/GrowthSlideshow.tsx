'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Pause,Play} from 'lucide-react';

const slides=[
 {title:'Big goals start with understanding.',from:'$100',to:'$1,000,000',tag:'Explore the math',copy:'That is 10,000× growth—an extreme illustrative outcome, not a typical trading result. Learn what risk, time and compounding really mean.',path:'M0 135L35 132L70 126L105 130L140 114L175 119L210 92L245 105L280 63L315 77L350 18'},
 {title:'Practice the process before the profit.',from:'$10,000',to:'$10,200',tag:'Virtual practice example',copy:'An illustrative 2% gain gives you a decision to review. What was your entry, how much did you risk, and was the outcome repeatable?',path:'M0 130L35 116L70 125L105 93L140 106L175 77L210 90L245 59L280 73L315 36L350 28'},
 {title:'Understand the downside, too.',from:'$1,000',to:'$800',tag:'Risk matters',copy:'After a 20% loss, a 25% gain is needed to return to $1,000. Learning to protect your capital matters as much as spotting an opportunity.',path:'M0 27L35 39L70 30L105 67L140 57L175 85L210 78L245 110L280 101L315 129L350 138'},
];
export default function GrowthSlideshow(){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{if(paused||reduced)return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),7000);return()=>window.clearInterval(timer);},[paused,reduced]);
 const slide=slides[index];
 return <section className="growth-slideshow" aria-label="Trading outcomes explained" aria-roledescription="carousel"><div className="growth-slide" key={index}><div><span className="eyebrow">ILLUSTRATIVE EXAMPLES</span><h2>See the numbers.<br/>Understand the journey.</h2><p>Explore growth, practice and risk before putting real money on the line.</p><Link href="/learn" className="growth-learn">Learn the foundations <ArrowUpRight size={17}/></Link></div><div className="growth-example"><div className="growth-amounts"><strong>{slide.from}</strong><ArrowUpRight aria-hidden="true"/><strong>{slide.to}</strong></div><svg viewBox="0 0 350 160" role="img" aria-label="Illustrative outcome curve, not historical market data"><defs><linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#62dfb2" stopOpacity=".28"/><stop offset="1" stopColor="#62dfb2" stopOpacity="0"/></linearGradient></defs><path d={`${slide.path}L350 160L0 160Z`} fill="url(#growthFill)"/><path d={slide.path} stroke={index===2?'#ffa3ac':'#62dfb2'} strokeWidth="3" fill="none"/></svg><small>Illustrative amounts—not typical results or promised returns. Trading can result in losses.</small></div></div><div className="growth-controls"><div>{slides.map((s,i)=><button key={s.title} aria-label={`Show example ${i+1}`} aria-pressed={index===i} onClick={()=>{setIndex(i);setPaused(true);}}>{i+1}</button>)}</div><button onClick={()=>setPaused(p=>!p)} disabled={reduced} aria-label={paused?'Play slideshow':'Pause slideshow'}>{paused||reduced?<Play size={15}/>:<Pause size={15}/>} {reduced?'Reduced motion':paused?'Play':'Pause'}</button></div></section>;
}
