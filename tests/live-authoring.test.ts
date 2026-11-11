import {it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {validateQuestions} from '../lib/games/authoring';
const question={question:' Choose a stock ',options:['Bond','Share','Cash','Fund'],answer:1,explanation:'A share represents ownership.'};
it('validates custom questions and selected answers without trusting malformed authoring',()=>{
 expect(validateQuestions([question])[0].question).toBe('Choose a stock');
 for(const value of [[],Array(21).fill(question),[{...question,answer:4}],[{...question,options:['yes','YES']}],[{...question,question:''}],[{...question,options:['']}],[{...question,explanation:'x'.repeat(601)}]])expect(()=>validateQuestions(value)).toThrow();
 expect(validateQuestions(Array(20).fill(question))).toHaveLength(20);
});
it('ends custom games at the selected count, including one and twenty questions',async()=>{
 const db=new PGlite(),host='00000000-0000-4000-8000-000000000001',token='a'.repeat(64);
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${host}');`);
  await db.exec(await readFile('lib/games/live.sql','utf8'));
  for(const [count,code] of [[1,'ABC222'],[3,'THREE2'],[20,'TWENTY']] as const){
   await db.query('select public.sprout_live_create($1,$2,$3,$4,45)',[host,code,'Custom quiz',JSON.stringify(validateQuestions(Array(count).fill(question)))]);
   const action=(name:string,index=0,choice:number|null=null)=>db.query('select public.sprout_live_action($1,$2,$3,$4,$5,$6,$7)',[code,token,host,name,index,choice,'Player']);
   const snapshot=async()=>(await db.query<{v:any}>('select public.sprout_live_snapshot($1,$2,$3) v',[code,token,host])).rows[0].v;
   await action('join');await action('start');expect((await snapshot()).total).toBe(count);
   for(let i=0;i<count;i++){expect((await snapshot()).question.answer).toBeUndefined();await action('answer',i,1);await action('reveal',i);expect((await snapshot()).self.correct).toBe(true);await action('next',i);}
   expect((await snapshot()).phase).toBe('finished');expect((await snapshot()).question).toBeNull();
  }
 }finally{await db.close();}
},30000);
