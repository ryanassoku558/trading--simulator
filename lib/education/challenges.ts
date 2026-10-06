import type {State} from "@/types";
export function challengeProgress(state:State){
 const c=state.challenge;
 if(!c)return 0;
 const reviewed=state.trades.slice(0,Math.max(0,state.trades.length-c.startTradeCount)).filter(t=>state.journal?.some(j=>j.tradeId===t.id&&j.note.trim()));
 return Math.min(c.id==="seven-days"?new Set(reviewed.map(t=>t.date.slice(0,10))).size:reviewed.length,c.id==="seven-days"?7:3);
}
