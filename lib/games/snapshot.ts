/** A delayed poll must never move a room back to an earlier round or phase. */
interface Snapshot {generation?:number;code:string;phase:'waiting'|'question'|'reveal'|'finished';index:number;serverNow:string;answeredCount:number;self:{submitted:boolean}|null}
export function acceptSnapshot(previous:Snapshot|null,next:Snapshot){
 if(!previous||previous.code!==next.code)return true;
 const oldGeneration=previous.generation??0,nextGeneration=next.generation??0;if(nextGeneration!==oldGeneration)return nextGeneration>oldGeneration;
 const rank=(s:Snapshot)=>s.phase==='finished'?Number.MAX_SAFE_INTEGER:s.index*2+({waiting:0,question:1,reveal:2}[s.phase]);
 const oldRank=rank(previous),nextRank=rank(next);if(nextRank!==oldRank)return nextRank>oldRank;
 if(previous.self?.submitted&&!next.self?.submitted)return false;
 if(next.answeredCount<previous.answeredCount)return false;
 return Date.parse(next.serverNow)>=Date.parse(previous.serverNow);
}
