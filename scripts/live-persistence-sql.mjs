import {readFileSync} from 'node:fs';
// Emit the additive production update from the canonical, locally tested live schema.
const sql=readFileSync(new URL('../lib/games/live.sql',import.meta.url),'utf8');
const start=sql.indexOf('create or replace function public.sprout_live_create(');
console.log("alter table sprout_live.rooms add column if not exists generation integer not null default 0;\nalter table sprout_live.rooms add column if not exists is_open boolean not null default false;\nalter table sprout_live.rooms alter column expires_at set default 'infinity';\nupdate sprout_live.rooms set expires_at='infinity',is_open=(phase in ('waiting','question','reveal')) where expires_at<>'infinity'::timestamptz;\n");
console.log(sql.slice(start));
