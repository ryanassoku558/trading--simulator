import {describe,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {gameQuestions,gamePacks,beginnerTerms} from '../lib/games/content';
const host='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
it('covers every curriculum topic in five-question solo packs and has enough beginner study cards',()=>{
 expect(gamePacks.filter(p=>p.kind==='module')).toHaveLength(51);expect(gamePacks.filter(p=>p.kind==='lesson')).toHaveLength(199);for(const pack of gamePacks){const questions=gameQuestions(pack.id);expect(questions).toHaveLength(5);for(const q of questions){expect(q.options[q.answer]).toBeTruthy();expect(q.explanation.length).toBeGreaterThan(10);}}
 expect(()=>gameQuestions('99')).toThrow();expect(beginnerTerms.length).toBeGreaterThanOrEqual(6);expect(new Set(beginnerTerms.map(t=>t[0])).size).toBe(beginnerTerms.length);
});
describe('server-authoritative live game database',()=>{
 it('protects rooms, hides answers, scores once, rejects foreign hosts and ends after five questions',async()=>{
  const db=new PGlite();
  try{
   await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${host}'),('${other}');`);
   await db.exec(await readFile(new URL('../lib/games/live.sql',import.meta.url),'utf8'));
   await db.exec('set role service_role');
   const questions=gameQuestions('0');Object.assign(questions[0],{presentation:{backgroundUrl:'https://example.test/signed-photo.jpg'}});
   await db.query('select public.sprout_live_create($1,$2,$3,$4,$5)',[host,'TEST22','Market Basics',JSON.stringify(questions),45]);
   await db.query('select public.sprout_live_dispatch($1,$2,$3,$4,0,null,null,0)',['TEST22','',host,'activate']);
   const action=async(name:string,token='a'.repeat(64),owner:string|null=null,index=0,choice:number|null=null,nickname:string|null=null)=>db.query('select public.sprout_live_action($1,$2,$3,$4,$5,$6,$7)', ['TEST22',token,owner,name,index,choice,nickname]);
   const snapshot=async(token='a'.repeat(64),owner:string|null=null)=>(await db.query<{value:any}>('select public.sprout_live_snapshot($1,$2,$3) as value',['TEST22',token,owner])).rows[0].value;
   await expect(snapshot()).rejects.toThrow(/nickname/);
   await action('join','a'.repeat(64),null,0,null,'Alpha');await action('join','b'.repeat(64),null,0,null,'Beta');
   await expect(action('join','c'.repeat(64),null,0,null,'alpha')).rejects.toThrow();
   await expect(action('start','a'.repeat(64),other)).rejects.toThrow(/host/);
   await action('start','',host);await expect(action('join','c'.repeat(64),null,0,null,'Late')).rejects.toThrow(/started/);
   let view=await snapshot();expect(view.presentation.backgroundUrl).toBe('https://example.test/signed-photo.jpg');expect(view.phase).toBe('question');expect(view.question.answer).toBeUndefined();expect(JSON.stringify(view)).not.toContain('explanation');
   await action('answer','a'.repeat(64),null,0,questions[0].answer);await action('answer','a'.repeat(64),null,0,(questions[0].answer+1)%3);
   view=await snapshot();expect(view.self.submitted).toBe(true);expect(view.self.correct).toBeUndefined();expect(view.self.points).toBeUndefined();expect(view.players.every((p:any)=>p.score===0)).toBe(true);
   expect((await db.query<{n:number}>('select count(*)::integer as n from sprout_live.answers')).rows[0].n).toBe(1);
   await action('reveal','',host);view=await snapshot();expect(view.question.answer).toBe(questions[0].answer);expect(view.self.correct).toBe(true);expect(view.self.points).toBeGreaterThanOrEqual(1000);expect(view.self.points).toBeLessThanOrEqual(1200);
   await expect(action('answer','b'.repeat(64),null,0,0)).rejects.toThrow(/closed/);
   await action('next','',host,0);await expect(action('next','',host,0)).rejects.toThrow(/moved on/);
   for(let i=1;i<5;i++){await action('answer','a'.repeat(64),null,i,questions[i].answer);await action('reveal','',host,i);await action('next','',host,i);}
   view=await snapshot();expect(view.phase).toBe('finished');expect(view.index).toBe(4);expect(view.question).toBeNull();expect(view.players[0].score).toBeGreaterThanOrEqual(5000);await expect(action('next','',host,4)).rejects.toThrow(/moved on/);
   await db.exec('set role anon');await expect(db.query('select public.sprout_live_snapshot($1,$2,$3)',['TEST22','a'.repeat(64),host])).rejects.toThrow(/permission denied/);await expect(db.query('select * from sprout_live.rooms')).rejects.toThrow(/permission denied/);await db.exec('reset role');
   await db.query('select public.sprout_live_create($1,$2,$3,$4,$5)',[host,'LATE22','Clock test',JSON.stringify(questions),30]);
   await db.query('select public.sprout_live_dispatch($1,$2,$3,$4,0,null,null,0)',['LATE22','',host,'activate']);
   await db.query('select public.sprout_live_action($1,$2,$3,$4,$5,$6,$7)',['LATE22','c'.repeat(64),null,'join',0,null,'Clock']);
   await db.query('select public.sprout_live_action($1,$2,$3,$4)',['LATE22','',host,'start']);
   await db.exec("update sprout_live.rooms set ends_at=now()-interval '1 second' where code='LATE22'");
   const late=(await db.query<{value:any}>('select public.sprout_live_snapshot($1,$2,$3) as value',['LATE22','c'.repeat(64),null])).rows[0].value;expect(late.phase).toBe('reveal');await expect(db.query('select public.sprout_live_action($1,$2,$3,$4,$5,$6)',['LATE22','c'.repeat(64),null,'answer',0,0])).rejects.toThrow(/closed/);
  }finally{await db.close();}
 },30000);
});
