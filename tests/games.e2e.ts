import {test,expect} from './fixtures';
import type {BrowserContext} from '@playwright/test';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {gameQuestions,beginnerTerms} from '../lib/games/content';

test('beginner home leads into bounded solo quests and guided study',async({page})=>{
 await page.goto('/');await expect(page.getByText('Not sure what to click?',{exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Open Simulator',exact:true})).toHaveAttribute('href','/market/AAPL?guided=1');
 await page.getByRole('link',{name:/Choose a game/}).click();await expect(page.getByRole('heading',{name:'Play & study',exact:true})).toBeVisible();await expect(page.getByText('This page has not sprouted yet.',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Play on my own',exact:false}).click();await page.getByRole('button',{name:'Start five-question quest',exact:true}).click();
 const questions=gameQuestions('0');for(let i=0;i<5;i++){await page.locator('.practice-quest .live-answer').nth(questions[i].answer).click();await page.getByRole('button',{name:i===4?'See quest results':'Next question',exact:true}).click();}
 await expect(page.getByRole('heading',{name:'Quest complete!',exact:true})).toBeVisible();await expect(page.locator('.practice-quest')).toContainText('5/5 correct');
 await page.getByRole('button',{name:'Study cards',exact:true}).click();
 for(let i=0;i<6;i++){await page.getByRole('button',{name:'Check my understanding',exact:true}).click();await page.locator('.study-options').getByRole('button',{name:beginnerTerms[i][1],exact:true}).click();await page.getByRole('button',{name:i===5?'See study results':'Next word',exact:true}).click();}
 await expect(page.getByRole('heading',{name:'Your first pass is complete',exact:true})).toBeVisible();await expect(page.locator('.study-coach')).toContainText('6/6 checks correct');
 await page.getByText('More ways to study: flashcards, matching & definition quizzes',{exact:true}).click();await expect(page.getByRole('region',{name:'Glossary practice',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Live quiz',exact:true}).click();await page.getByRole('button',{name:'Sign in or create an account',exact:true}).click();await expect(page.getByRole('dialog',{name:'Your Sprout account',exact:true})).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('a host and two independent guests complete one synchronized five-question game',async({browser,baseURL})=>{
 test.setTimeout(90000);const db=new PGlite(),contexts:BrowserContext[]=[];
 const hostId='00000000-0000-4000-8000-000000000001';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${hostId}');`);await db.exec(await readFile('lib/games/live.sql','utf8'));
  const hostContext=await browser.newContext({baseURL}),aContext=await browser.newContext({baseURL}),bContext=await browser.newContext({baseURL});contexts.push(hostContext,aContext,bContext);
  const hashes=new Map(contexts.map(c=>[c,createHash('sha256').update(randomBytes(32)).digest('hex')]));
  for(const context of contexts){await context.route('**/api/live**',async route=>{
   try{
    const req=route.request(),body=req.method()==='POST'?req.postDataJSON():null,isHost=context===hostContext,code=body?.code||new URL(req.url()).searchParams.get('code');let result;
    if(body?.action==='create'){await db.query('select public.sprout_live_create($1,$2,$3,$4,$5)',[hostId,'TEST22','Market Basics',JSON.stringify(gameQuestions('0')),45]);result={code:'TEST22'};}
    else if(body){const answer=await db.query<{value:object}>('select public.sprout_live_action($1,$2,$3,$4,$5,$6,$7) as value',[code,hashes.get(context),isHost?hostId:null,body.action,body.index??0,body.choice??null,body.nickname??null]);result={...answer.rows[0].value,code};}
    else result=(await db.query<{value:object}>('select public.sprout_live_snapshot($1,$2,$3) as value',[code,hashes.get(context),isHost?hostId:null])).rows[0].value;
    await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});
   }catch(e){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:e instanceof Error?e.message:'Test request failed'})});}
  });}
  const host=await hostContext.newPage(),a=await aContext.newPage(),b=await bContext.newPage();
  await host.goto('/play');await host.getByRole('button',{name:'Live quiz',exact:true}).click();await host.getByRole('button',{name:'Create a live room',exact:true}).click();await expect(host.getByRole('heading',{name:'Your room is ready. Invite your players.',exact:true})).toBeVisible();
  for(const [page,nickname] of [[a,'Alpha'],[b,'Beta']] as const){await page.goto('/play?room=TEST22');await page.getByRole('textbox',{name:'Your nickname',exact:true}).fill(nickname);await page.getByRole('button',{name:'Join with code',exact:true}).click();await expect(page.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();}
  await a.reload();await expect(a.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();
  await host.getByRole('button',{name:'Start five-question game',exact:true}).click();
  const questions=gameQuestions('0');
  for(let i=0;i<5;i++){
   for(const page of [a,b]){await expect(page.getByText(`Question ${i+1} of 5`,{exact:true})).toBeVisible();await page.locator('.live-answer').nth(questions[i].answer).click();await expect(page.getByText(/Answer saved. Wait for the reveal./)).toBeVisible();}
   await expect(host.getByText(/2\/2 answered/)).toBeVisible();await host.getByRole('button',{name:'Reveal answer',exact:true}).click();
   for(const page of [a,b])await expect(page.getByRole('heading',{name:'Correct—nice work!',exact:true})).toBeVisible();
   await host.getByRole('button',{name:i===4?'Show final results':'Next question',exact:true}).click();
  }
  for(const page of [host,a,b]){await expect(page.getByRole('heading',{name:'Game complete! Everyone learned something.',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Final leaderboard',exact:true})).toBeVisible();await expect(page.locator('.live-scoreboard li')).toHaveCount(2);}
  await a.setViewportSize({width:390,height:844});expect(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await Promise.all(contexts.map(c=>c.close()));await db.close();}
});

test('an invite stops pre-join polling so account guidance is not overwritten',async({page})=>{
 let reads=0;await page.route('**/api/live**',async route=>{if(route.request().method()==='GET'){reads++;await route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Enter your nickname to join this room.'})});}else await route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Sign in to host a game. Anyone with a Sprout account can host.'})});});
 await page.goto('/play?room=TEST22');await expect(page.locator('.live-game [role=alert]')).toContainText('Enter your nickname');await page.getByRole('button',{name:'Create a live room',exact:true}).click();await expect(page.locator('.live-game [role=alert]')).toContainText('Sign in to host a game');
 // Wait through one would-be poll interval to check this observed error-message race.
 await page.waitForTimeout(2200);expect(reads).toBe(1);await expect(page.locator('.live-game [role=alert]')).toContainText('Sign in to host a game');
});
