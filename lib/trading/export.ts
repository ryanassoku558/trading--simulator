import type {State} from '@/types';
function cell(value:string|number){if(typeof value==='number')return String(value);const safe=/^[\s]*[=+\-@]/.test(value)?`'${value}`:value;return `"${safe.replaceAll('"','""')}"`;}
export function tradesCsv(state:State){
 const rows:(string|number)[][]=[['Data type','Trade ID','Date','Ticker','Side','Quantity','Generated fill USD','Total USD','Realized P/L USD','Journal note','Emotion','Recorded initial risk USD']];
 for(const t of state.trades){const j=state.journal?.find(n=>n.tradeId===t.id);rows.push(['SIMULATED',t.id,t.date,t.ticker,t.side,t.shares,t.price,t.total,t.realized,j?.note||'',j?.emotion||'',j?.initialRisk??'']);}
 return '\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
