import {it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
const host='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
it('lets only an inactive quiz’s owner edit and saves new content without changing its code',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${host}'),('${other}');`);await db.exec(await readFile('lib/games/live.sql','utf8'));await db.exec('set role service_role');
  const questions=[{question:'Original question?',options:['Original answer','Other answer'],answer:0,explanation:'Original explanation.'}];await db.query('select public.sprout_live_save($1,$2,$3,$4,45)',[host,'EDTR22','Original quiz',JSON.stringify(questions)]);
  const edit=async(owner=host)=>(await db.query<{v:any}>('select public.sprout_live_editor($1,$2) v',['EDTR22',owner])).rows[0].v;
  const update=(generation:number,owner=host,content=questions)=>db.query('select public.sprout_live_update($1,$2,$3,$4,90,$5)',['EDTR22',owner,'Revised quiz',JSON.stringify(content),generation]);
  expect((await edit()).questions[0].answer).toBe(0);await expect(edit(other)).rejects.toThrow(/host/);await expect(update(0,other)).rejects.toThrow(/host/);
  const revised=[{question:'New question?',options:['Incorrect answer','Correct answer'],answer:1,explanation:'New explanation.'},{...questions[0],question:'Second question?'}];await update(0,host,revised);let loaded=await edit();expect(loaded.code).toBe('EDTR22');expect(loaded.title).toBe('Revised quiz');expect(loaded.seconds).toBe(90);expect(loaded.questions).toEqual(revised);expect(loaded.generation).toBe(1);await expect(update(0)).rejects.toThrow(/another tab/);
  const action=(name:string,index=0,choice:number|null=null)=>db.query('select public.sprout_live_dispatch($1,$2,$3,$4,$5,$6,$7,1)',['EDTR22','a'.repeat(64),host,name,index,choice,'Learner']);
  await action('activate');await expect(edit()).rejects.toThrow(/active session/);await expect(update(1)).rejects.toThrow(/active session/);await action('join');await action('start');await action('answer',0,1);await action('reveal');await action('next');await action('answer',1,0);await action('reveal',1);await action('next',1);expect((await edit()).phase).toBe('finished');
  await update(1,host,revised);loaded=await edit();expect(loaded.generation).toBe(2);expect(loaded.phase).toBe('waiting');expect((await db.query<{n:number}>('select count(*)::integer n from sprout_live.players')).rows[0].n).toBe(0);expect((await db.query<{n:number}>('select count(*)::integer n from sprout_live.answers')).rows[0].n).toBe(0);
  await db.exec('set role anon');await expect(edit()).rejects.toThrow(/permission denied/);await expect(update(2)).rejects.toThrow(/permission denied/);
 }finally{await db.close();}
},30000);
