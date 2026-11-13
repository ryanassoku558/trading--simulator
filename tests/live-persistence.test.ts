import {it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
const host='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002',token='a'.repeat(64);
it('saves permanent quizzes privately, gates joining on activation, and safely reuses the same code',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${host}'),('${other}');`);await db.exec(await readFile('lib/games/live.sql','utf8'));await db.exec('set role service_role');
  const questions=[{question:'What is a share?',options:['Ownership','A loan'],answer:0,explanation:'A share is an ownership interest.'}];
  // More than three saved waiting rooms are allowed and none expires automatically.
  for(const code of ['SAVE22','SAVE23','SAVE24','SAVE25'])await db.query('select public.sprout_live_save($1,$2,$3,$4,45)',[host,code,'Presentation quiz',JSON.stringify(questions)]);
  const saved=async(owner:string)=>(await db.query<{v:any}>('select public.sprout_live_saved($1) v',[owner])).rows[0].v;
  expect(await saved(host)).toHaveLength(4);expect(await saved(other)).toEqual([]);expect(JSON.stringify(await saved(host))).not.toContain('Ownership');
  expect((await db.query<{v:boolean}>("select bool_and(expires_at>now()+interval '100 years') v from sprout_live.rooms")).rows[0].v).toBe(true);
  const action=(name:string,owner:string|null=host,generation=0,nickname:string|null=null)=>db.query('select public.sprout_live_dispatch($1,$2,$3,$4,0,0,$5,$6)',['SAVE22',token,owner,name,nickname,generation]);
  const snapshot=async(owner:string|null=host)=>(await db.query<{v:any}>('select public.sprout_live_snapshot($1,$2,$3) v',['SAVE22',token,owner])).rows[0].v;
  await expect(action('join',null,0,'Learner')).rejects.toThrow(/not activated/);await expect(action('activate',other)).rejects.toThrow(/host/);
  await action('activate');await action('join',null,0,'Learner');await action('start');await action('answer',null);await action('reveal');await action('next');expect((await snapshot()).phase).toBe('finished');expect((await snapshot(null)).self.correct).toBe(true);
  await expect(action('reset',other)).rejects.toThrow(/host/);await action('reset');let view=await snapshot();expect(view.generation).toBe(1);expect(view.isOpen).toBe(false);expect(view.phase).toBe('waiting');expect(view.players).toEqual([]);expect(view.code).toBe('SAVE22');
  expect((await db.query<{n:number}>('select count(*)::integer n from sprout_live.answers')).rows[0].n).toBe(0);
  await expect(action('start',host,0)).rejects.toThrow(/session has changed/);await expect(action('answer',null,0)).rejects.toThrow(/session has changed/);await expect(action('join',null,1,'Learner')).rejects.toThrow(/not activated/);
  await action('activate',host,1);await action('join',null,1,'Learner');await action('start',host,1);await expect(action('reset',host,1)).rejects.toThrow(/Finish/);await action('answer',null,1);await action('reveal',host,1);await action('next',host,1);expect((await snapshot()).players[0].score).toBeGreaterThanOrEqual(1000);
  await db.exec('set role anon');await expect(saved(host)).rejects.toThrow(/permission denied/);await expect(action('activate')).rejects.toThrow(/permission denied/);
 }finally{await db.close();}
},30000);
