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

test('a host and two independent guests complete one synchronized custom three-question game',async({browser,baseURL})=>{
 test.setTimeout(90000);const db=new PGlite(),contexts:BrowserContext[]=[];
 const hostId='00000000-0000-4000-8000-000000000001';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${hostId}');`);await db.exec(await readFile('lib/games/live.sql','utf8'));
  const hostContext=await browser.newContext({baseURL}),aContext=await browser.newContext({baseURL}),bContext=await browser.newContext({baseURL});contexts.push(hostContext,aContext,bContext);
  const hashes=new Map(contexts.map(c=>[c,createHash('sha256').update(randomBytes(32)).digest('hex')]));
  for(const context of contexts){await context.route('**/api/live**',async route=>{
   try{
    const req=route.request(),body=req.method()==='POST'?req.postDataJSON():null,isHost=context===hostContext,code=body?.code||new URL(req.url()).searchParams.get('code');let result;
    if(body?.action==='create'){await db.query('select public.sprout_live_create($1,$2,$3,$4,$5)',[hostId,'TEST22','Market Basics',JSON.stringify(body.questions??gameQuestions('0')),45]);result={code:'TEST22'};}
    else if(body){const answer=await db.query<{value:object}>('select public.sprout_live_action($1,$2,$3,$4,$5,$6,$7) as value',[code,hashes.get(context),isHost?hostId:null,body.action,body.index??0,body.choice??null,body.nickname??null]);result={...answer.rows[0].value,code};}
    else result=(await db.query<{value:object}>('select public.sprout_live_snapshot($1,$2,$3) as value',[code,hashes.get(context),isHost?hostId:null])).rows[0].value;
    await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});
   }catch(e){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:e instanceof Error?e.message:'Test request failed'})});}
  });}
  const host=await hostContext.newPage(),a=await aContext.newPage(),b=await bContext.newPage();
  await host.goto('/play');await host.getByRole('button',{name:'Live quiz',exact:true}).click();await host.getByRole('button',{name:'＋ Add question',exact:true}).click();await expect(host.getByRole('spinbutton',{name:'Number of questions',exact:true})).toHaveValue('6');await host.getByRole('spinbutton',{name:'Number of questions',exact:true}).fill('3');await host.locator('.live-editor summary').first().click();await host.getByRole('textbox',{name:'Question 1',exact:true}).fill('Which answer did the host choose?');await host.getByRole('radio',{name:'Question 1 correct answer 2',exact:true}).check();await host.getByRole('button',{name:'Create a live room',exact:true}).click();await expect(host.getByRole('heading',{name:'Your room is ready. Invite your players.',exact:true})).toBeVisible();
  for(const [page,nickname] of [[a,'Alpha'],[b,'Beta']] as const){await page.goto('/play?room=TEST22');await page.getByRole('textbox',{name:'Your nickname',exact:true}).fill(nickname);await page.getByRole('button',{name:'Join with code',exact:true}).click();await expect(page.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();}
  await a.reload();await expect(a.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();
  await host.getByRole('button',{name:'Full screen',exact:true}).click();await expect.poll(()=>host.evaluate(()=>!!document.fullscreenElement)).toBe(true);await host.evaluate(()=>document.exitFullscreen());await host.getByRole('button',{name:'Start 3-question game',exact:true}).click();
  const questions=gameQuestions('0').slice(0,3);questions[0].answer=1;
  for(let i=0;i<3;i++){
   for(const page of [a,b]){await expect(page.getByText(`Question ${i+1} of 3`,{exact:true})).toBeVisible();await page.locator('.live-answer').nth(questions[i].answer).click();await expect(page.getByText(/Answer saved. Wait for the reveal./)).toBeVisible();}
   await expect(host.getByText(/2\/2 answered/)).toBeVisible();await host.getByRole('button',{name:'Reveal answer',exact:true}).click();
   for(const page of [a,b])await expect(page.getByRole('heading',{name:'Correct—nice work!',exact:true})).toBeVisible();
   await expect(host.getByLabel('Answer results', {exact:true})).toBeVisible();await host.getByRole('button',{name:i===2?'Show final results':'Next question',exact:true}).click();
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

test('host drafts survive refresh, keep topic edits, reorder and preview without creating a room',async({page})=>{
 let requests=0;await page.route('**/api/live**',r=>{requests++;return r.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Sign in to host.'})});});
 await page.goto('/play');await page.getByRole('button',{name:'Live quiz',exact:true}).click();
 await page.getByRole('textbox',{name:'Quiz name',exact:true}).fill('My saved quiz');
 await page.locator('.live-editor summary').first().click();
 await page.getByRole('textbox',{name:'Question 1',exact:true}).fill('My custom question');
 await page.getByRole('button',{name:'Duplicate question 1',exact:true}).click();
 await page.getByRole('button',{name:'Move question 1 down',exact:true}).click();
 await page.getByRole('textbox',{name:'Question 1',exact:true}).fill('First question after reordering');
 await page.getByLabel('Quiz topic',{exact:true}).selectOption('1');
 await expect(page.getByRole('textbox',{name:'Question 1',exact:true})).toHaveValue('First question after reordering');
 // An unfinished custom question is still a valid saved draft.
 await page.getByRole('button',{name:'＋ Add question',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sprout-live-draft-v1')||'{}').questions?.length)).toBe(7);
 await page.reload();await page.getByRole('button',{name:'Live quiz',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Quiz name',exact:true})).toHaveValue('My saved quiz');
 await expect(page.getByRole('spinbutton',{name:'Number of questions',exact:true})).toHaveValue('7');
 await page.getByRole('button',{name:'Preview quiz',exact:true}).click();await expect(page.locator('.live-quiz-builder [role=alert]')).toContainText('Question 7 needs a question');await expect(page.getByRole('textbox',{name:'Question 7',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Remove question 7',exact:true}).click();
 await page.getByRole('button',{name:'Preview quiz',exact:true}).click();await expect(page.getByRole('heading',{name:'Quiz preview',exact:true})).toBeFocused();
 const preview=page.getByRole('region',{name:'Quiz preview',exact:true});await expect(preview).toContainText('First question after reordering');
 await page.getByRole('button',{name:'Show preview answer',exact:true}).click();await expect(preview.locator('.correct-answer')).toHaveCount(1);
 await page.getByRole('button',{name:'Next preview question',exact:true}).click();await expect(preview).toContainText('My custom question');await expect(preview.locator('.correct-answer')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(requests).toBe(0);
});

test('quiz topics cover the full curriculum and support module, lesson and mixed-topic games',async({page})=>{
 await page.goto('/play');await page.getByRole('button',{name:'Live quiz',exact:true}).click();
 const picker=page.locator('.live-quiz-builder .quiz-topic-picker'),select=picker.getByRole('combobox',{name:'Quiz topic',exact:true});
 await expect(picker).toContainText('41 modules · 159 lessons');await expect(select.locator('optgroup[label="Modules"] option')).toHaveCount(41);await expect(select.locator('optgroup[label="Lessons"] option')).toHaveCount(159);
 await select.selectOption('40');await page.getByRole('button',{name:'Use topic questions',exact:true}).click();
 const moduleQuestions=await page.locator('.live-editor details').count();expect(moduleQuestions).toBeGreaterThan(0);
 await picker.getByRole('searchbox',{name:'Find a module or lesson',exact:true}).fill('What is a stock?');await select.selectOption('lesson:1');await page.getByRole('button',{name:'Use topic questions',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Number of questions',exact:true})).toHaveValue('1');await expect(page.locator('.live-editor summary')).toContainText('What does a share represent?');
 await picker.getByRole('searchbox').fill('');await select.selectOption('40');await page.getByRole('button',{name:'Add topic questions',exact:true}).click();await expect(page.locator('.live-editor details')).toHaveCount(moduleQuestions+1);
 await page.getByRole('button',{name:'Preview quiz',exact:true}).click();await expect(page.getByRole('region',{name:'Quiz preview',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sprout-live-draft-v1')||'{}').pack)).toBe('40');await page.reload();await page.getByRole('button',{name:'Live quiz',exact:true}).click();await expect(page.getByRole('combobox',{name:'Quiz topic',exact:true})).toHaveValue('40');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
