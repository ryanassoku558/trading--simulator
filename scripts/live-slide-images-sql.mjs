import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../lib/games/live.sql',import.meta.url),'utf8');
const start=sql.indexOf('create or replace function public.sprout_live_snapshot('),end=sql.indexOf('create or replace function public.sprout_live_saved(',start);
if(start<0||end<0)throw Error('Snapshot function not found.');
console.log(sql.slice(start,end));
console.log("revoke all on function public.sprout_live_snapshot(text,text,uuid) from public,anon,authenticated;\ngrant execute on function public.sprout_live_snapshot(text,text,uuid) to service_role;\nnotify pgrst,'reload schema';");
