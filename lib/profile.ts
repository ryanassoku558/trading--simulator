import type {State} from '@/types';
import {lessons,levels} from '@/lib/education';
export function profileInsights(state:State){
 const modules=levels.filter((_,i)=>lessons.filter(l=>l.level===i+1).every(l=>state.learning.completed.includes(l.id))).length;
 const topics=levels.map((name,i)=>({name,count:state.learning.attempts.filter(a=>lessons.find(l=>l.id===a.lessonId)?.level===i+1).length})).filter(t=>t.count).sort((a,b)=>b.count-a.count).slice(0,3);
 const weak=Array.from(new Set(state.learning.attempts.filter(a=>!a.correct).map(a=>a.lessonId))).map(id=>lessons.find(l=>l.id===id)!).slice(0,3);
 const recent=state.trades.slice(-20),missing=recent.filter(t=>!(state.journal??[]).some(j=>j.tradeId===t.id&&j.initialRisk)).length;
 const tilt=state.moods?.slice(-3).some(m=>m.mood==='Tilt')??false;
 const rapid=recent.filter((t,i)=>i>0&&Math.abs(Date.parse(t.date)-Date.parse(recent[i-1].date))<60000).length;
 const risk=recent.length?Math.min(100,Math.round(missing/recent.length*40+rapid/Math.max(1,recent.length-1)*40+(tilt?20:0))):null;
 return {modules,topics,weak,risk,missing,rapid,tilt,level:state.learning.completed.length>=30?4:state.learning.completed.length>=10?3:state.learning.completed.length>0?2:1};
}
