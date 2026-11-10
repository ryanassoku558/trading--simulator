export interface Activity {learning:number;simulator:number;}
const listeners=new Set<()=>void>();
export const subscribeActivity=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export function readActivity(id:string):Activity{try{const a=JSON.parse(localStorage.getItem(`sprout-activity-${id}`)||'{}');return {learning:Number.isFinite(a.learning)&&a.learning>=0?a.learning:0,simulator:Number.isFinite(a.simulator)&&a.simulator>=0?a.simulator:0};}catch{return {learning:0,simulator:0};}}
export function addActivity(id:string,kind:keyof Activity,seconds:number){try{const a=readActivity(id);a[kind]+=seconds;localStorage.setItem(`sprout-activity-${id}`,JSON.stringify(a));listeners.forEach(l=>l());}catch{}}
export function activitySnapshot(id:string){try{return typeof window==='undefined'?'{}':localStorage.getItem(`sprout-activity-${id}`)||'{}';}catch{return '{}';}}
