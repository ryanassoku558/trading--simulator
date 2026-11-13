import {test,expect} from './fixtures';
import type {BrowserContext} from '@playwright/test';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {initialState} from '../lib/trading';
import {gameQuestions} from '../lib/games/content';

test('Play and study presents flashcards and live quizzes without Practice Quest',async({page})=>{
 await page.goto('/play');await expect(page.getByRole('heading',{name:/A smarter way/})).toBeVisible();await expect(page.getByRole('button',{name:'Practice quest',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Start flipping',exact:false}).click();const cards=page.getByRole('region',{name:'Flashcards',exact:true});const card=cards.locator('.flip-card');await expect(card).toHaveAttribute('aria-pressed','false');await card.click();await expect(card).toHaveAttribute('aria-pressed','true');await expect(cards.locator('.flip-card-back')).toContainText('DEFINITION');await cards.getByRole('button',{name:'Next flashcard',exact:true}).click();await expect(card).toHaveAttribute('aria-pressed','false');await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Live quiz',exact:true}).click();await expect(page.getByRole('link',{name:/I’m joining/})).toBeVisible();await expect(page.getByRole('link',{name:/I’m hosting/})).toBeVisible();
});

test('a host and two independent guests complete one synchronized custom three-question game',async({browser,baseURL})=>{
 test.setTimeout(120000);const db=new PGlite(),contexts:BrowserContext[]=[];
 const hostId='00000000-0000-4000-8000-000000000001';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${hostId}');`);await db.exec(await readFile('lib/games/live.sql','utf8'));
  const hostContext=await browser.newContext({baseURL}),aContext=await browser.newContext({baseURL}),bContext=await browser.newContext({baseURL});contexts.push(hostContext,aContext,bContext);
  const user={id:hostId,email:'host@example.test',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{first_name:'Host'},created_at:'2026-10-01T00:00:00Z'};
  await hostContext.addInitScript(({user})=>localStorage.setItem('sb-kbphftwnggadpfbyctve-auth-token',JSON.stringify({access_token:'fixture',refresh_token:'fixture-refresh',expires_at:4102444800,token_type:'bearer',user})),{user});
  await hostContext.route('**/auth/v1/user**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(user)}));await hostContext.route('**/rest/v1/paper_accounts**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify([{account:{...initialState(),profile:{...initialState().profile,id:hostId,name:'Host',onboarded:true}},updated_at:'2026-10-06T00:00:00Z'}])}));await hostContext.route('**/api/billing/status',r=>r.fulfill({contentType:'application/json',body:'{"pro":false,"ready":false}'}));
  const hashes=new Map(contexts.map(c=>[c,createHash('sha256').update(randomBytes(32)).digest('hex')]));
  for(const context of contexts){await context.route('**/api/live**',async route=>{
   try{
    const req=route.request(),body=req.method()==='POST'?req.postDataJSON():null,isHost=context===hostContext,code=body?.code||new URL(req.url()).searchParams.get('code');let result;
    if(!body&&new URL(req.url()).searchParams.get('saved')==='1'){result={quizzes:(await db.query<{value:object}>('select public.sprout_live_saved($1) as value',[isHost?hostId:null])).rows[0].value};}
    else if(body?.action==='create'){await db.query('select public.sprout_live_save($1,$2,$3,$4,$5)',[hostId,'TEST22','Market Basics',JSON.stringify((body.questions??gameQuestions('0')).map((q:object,i:number)=>i===0?{...q,presentation:{backgroundUrl:'https://example.test/shared-forest.jpg'}}:q)),45]);result={code:'TEST22'};}
    else if(body){const answer=await db.query<{value:object}>('select public.sprout_live_dispatch($1,$2,$3,$4,$5,$6,$7,$8) as value',[code,hashes.get(context),isHost?hostId:null,body.action,body.index??0,body.choice??null,body.nickname??null,body.generation??0]);result={...answer.rows[0].value,code};}
    else result=(await db.query<{value:object}>('select public.sprout_live_snapshot($1,$2,$3) as value',[code,hashes.get(context),isHost?hostId:null])).rows[0].value;
    await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});
   }catch(e){await route.fulfill({status:(e as {code?:string}).code==='42501'?403:400,contentType:'application/json',body:JSON.stringify({error:e instanceof Error?e.message:'Test request failed'})});}
  });}
  const host=await hostContext.newPage(),a=await aContext.newPage(),b=await bContext.newPage();
  await host.goto('/play');await host.getByRole('button',{name:'Live quiz',exact:true}).click();await host.getByRole('button',{name:'＋ Add question',exact:true}).click();await expect(host.getByRole('spinbutton',{name:'Number of questions',exact:true})).toHaveValue('6');await host.getByRole('spinbutton',{name:'Number of questions',exact:true}).fill('3');await host.locator('.live-editor summary').first().click();await host.getByRole('textbox',{name:'Question 1',exact:true}).fill('Which answer did the host choose?');await host.getByRole('radio',{name:'Question 1 correct answer 2',exact:true}).check();await host.getByRole('button',{name:'Create a live room',exact:true}).click();await expect(host.getByRole('heading',{name:'Quiz saved. Activate when you’re ready.',exact:true})).toBeVisible();await a.goto('/play?room=TEST22');await a.getByRole('textbox',{name:'Your nickname',exact:true}).fill('Alpha');await a.getByRole('button',{name:'Join with code',exact:true}).click();await expect(a.locator('.live-game>[role=alert]')).toContainText('not activated');await host.getByRole('button',{name:'Activate game',exact:true}).click();await expect(host.getByRole('heading',{name:'Your room is ready. Invite your players.',exact:true})).toBeVisible();
  for(const [page,nickname] of [[a,'Alpha'],[b,'Beta']] as const){await page.goto('/play?room=TEST22');await page.getByRole('textbox',{name:'Your nickname',exact:true}).fill(nickname);await page.getByRole('button',{name:'Join with code',exact:true}).click();await expect(page.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();}
  await a.reload();await expect(a.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();
  await host.getByRole('button',{name:'Full screen',exact:true}).click();await expect.poll(()=>host.evaluate(()=>!!document.fullscreenElement)).toBe(true);await host.evaluate(()=>document.exitFullscreen());await host.getByRole('button',{name:'Start 3-question game',exact:true}).click();
  const questions=gameQuestions('0').slice(0,3);questions[0].answer=1;
  for(let i=0;i<3;i++){
   for(const page of [a,b]){await expect(page.locator('.live-game')).toHaveCSS('background-image',/shared-forest/);await expect(page.getByText(`Question ${i+1} of 3`,{exact:true})).toBeVisible();await page.locator('.live-answer').nth(questions[i].answer).click();await expect(page.getByText(/Answer saved. Wait for the reveal./)).toBeVisible();}
   await expect(host.getByText(/2\/2 answered/)).toBeVisible();await host.getByRole('button',{name:'Reveal answer',exact:true}).click();
   for(const page of [a,b])await expect(page.getByRole('heading',{name:'Correct—nice work!',exact:true})).toBeVisible();
   await expect(host.getByLabel('Answer results', {exact:true})).toBeVisible();await host.getByRole('button',{name:i===2?'Show final results':'Next question',exact:true}).click();
  }
  for(const page of [host,a,b]){await expect(page.getByRole('heading',{name:'Knowledge grows here.',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Final leaderboard',exact:true})).toBeVisible();await expect(page.locator('.live-scoreboard li')).toHaveCount(2);}
  await host.getByRole('button',{name:'Leave room',exact:true}).click();await expect(host).toHaveURL(/\/play$/);await host.reload();await host.getByRole('button',{name:'Live quiz',exact:true}).click();const saved=host.getByRole('region',{name:'Saved quizzes',exact:true});await expect(saved).toContainText('Market Basics');await saved.getByRole('button',{name:'Open saved quiz Market Basics',exact:true}).click();await expect(host.getByRole('heading',{name:'Final leaderboard',exact:true})).toBeVisible();
  host.once('dialog',d=>d.accept());await host.getByRole('button',{name:'Prepare next session',exact:true}).click();await expect(host.getByRole('button',{name:'Activate game',exact:true})).toBeVisible();await expect(host.locator('.live-code')).toHaveText('TEST22');await expect(host.locator('.live-room-invite')).toContainText('do not expire');await host.getByRole('button',{name:'Activate game',exact:true}).click();
  await expect(a.getByRole('textbox',{name:'Your nickname',exact:true})).toBeVisible();await a.getByRole('textbox',{name:'Your nickname',exact:true}).fill('Alpha');await a.getByRole('button',{name:'Join with code',exact:true}).click();await expect(a.getByRole('heading',{name:'You’re in! Wait for the host to start.',exact:true})).toBeVisible();await expect(host.locator('.live-player-list')).toContainText('Alpha');await expect(host.locator('.live-player-list')).not.toContainText('Beta');await host.getByRole('button',{name:'Start 3-question game',exact:true}).click();await expect(a.getByText('Question 1 of 3',{exact:true})).toBeVisible();await a.locator('.live-answer').nth(1).click();await expect(a.getByText(/Answer saved/)).toBeVisible();await host.getByRole('button',{name:'Reveal answer',exact:true}).click();await expect(a.getByRole('heading',{name:'Correct—nice work!',exact:true})).toBeVisible();
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
 await expect(picker).toContainText('51 modules · 199 lessons');await expect(select.locator('optgroup[label="Modules"] option')).toHaveCount(51);await expect(select.locator('optgroup[label="Lessons"] option')).toHaveCount(199);
 await select.selectOption('40');await page.getByRole('button',{name:'Use topic questions',exact:true}).click();
 const moduleQuestions=await page.locator('.live-editor details').count();expect(moduleQuestions).toBeGreaterThan(0);
 await picker.getByRole('searchbox',{name:'Find a module or lesson',exact:true}).fill('What is a stock?');await select.selectOption('lesson:1');await page.getByRole('button',{name:'Use topic questions',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Number of questions',exact:true})).toHaveValue('1');await expect(page.locator('.live-editor summary')).toContainText('What does a share represent?');
 await picker.getByRole('searchbox').fill('');await select.selectOption('40');await page.getByRole('button',{name:'Add topic questions',exact:true}).click();await expect(page.locator('.live-editor details')).toHaveCount(moduleQuestions+1);
 await page.getByRole('button',{name:'Preview quiz',exact:true}).click();await expect(page.getByRole('region',{name:'Quiz preview',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sprout-live-draft-v1')||'{}').pack)).toBe('40');await page.reload();await page.getByRole('button',{name:'Live quiz',exact:true}).click();await expect(page.getByRole('combobox',{name:'Quiz topic',exact:true})).toHaveValue('40');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
