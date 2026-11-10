export function positionSize(balance:number,riskPercent:number,entry:number,stop:number){
 if(![balance,riskPercent,entry,stop].every(Number.isFinite)||balance<=0||riskPercent<=0||riskPercent>100||entry<=0||stop<=0||stop>=entry)return null;
 const budget=balance*(riskPercent/100),distance=entry-stop;
 const shares=Math.floor(Math.min(1000000,budget/distance,balance/entry));
 return {shares,budget,plannedRisk:shares*distance,cost:shares*entry};
}
export function hypotheticalProfit(shares:number,entry:number,exit:number){return shares*(exit-entry);}
export function volatility(closes:number[]){
 if(closes.length<2)return 0;
 const returns=closes.slice(1).map((p,i)=>closes[i]>0?(p/closes[i]-1)*100:0);
 const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
 return Math.sqrt(returns.reduce((s,r)=>s+(r-mean)**2,0)/returns.length);
}
export const moods=['Calm','Fear','Greed','Tilt','Hesitation'] as const;
export function moodWarning(entries:{mood:string}[]){const recent=entries.slice(-3);return recent.some(e=>e.mood==='Tilt')||recent.filter(e=>e.mood==='Fear'||e.mood==='Greed').length>=2;}
