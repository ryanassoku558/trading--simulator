import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../lib/games/live.sql',import.meta.url),'utf8');
const start=sql.indexOf('-- Saved quiz editing:');
if(start<0)throw Error('Saved quiz editing SQL not found.');
console.log(sql.slice(start));
