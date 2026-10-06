import type {State} from "@/types";
import {portfolio} from "./index";
export function performance(state: State) {
 const closed=state.trades.filter(t=>t.side==="sell");
 const decisive=closed.filter(t=>t.realized!==0);
 const wins=decisive.filter(t=>t.realized>0).length;
 const risks=new Map((state.journal??[]).filter(j=>j.initialRisk && j.initialRisk>0).map(j=>[j.tradeId,j.initialRisk!]));
 const r=closed.filter(t=>risks.has(t.id)).map(t=>t.realized/risks.get(t.id)!);
 const values=[...state.snapshots.map(s=>s.value),portfolio(state).value];
 let peak=values[0]??10000,maxDrawdown=0;
 for(const value of values){peak=Math.max(peak,value);if(peak>0)maxDrawdown=Math.max(maxDrawdown,(peak-value)/peak*100);}
 return {bestTrade:closed.length?closed.reduce((a,b)=>a.realized>b.realized?a:b):null,worstTrade:closed.length?closed.reduce((a,b)=>a.realized<b.realized?a:b):null,closed:closed.length,wins,winRate:decisive.length ? wins/decisive.length*100 : null,breakeven:closed.length-decisive.length,averageR:r.length?r.reduce((a,b)=>a+b,0)/r.length:null,rCount:r.length,maxDrawdown,realized:closed.reduce((n,t)=>n+t.realized,0)};
}
