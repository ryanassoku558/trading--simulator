import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

const port=process.env.TEST_PORT||'3100';
const base=process.env.TEST_BASE_URL||`http://127.0.0.1:${port}`;
const server=process.env.TEST_BASE_URL?null:spawn(process.execPath,['server.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:port},stdio:'ignore'});
let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}if(i===49)throw Error('Test server did not start');await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('#learn-detail h3').waitFor();
 const completeLessons=async()=>{for(let j=0;j<3;j++)await page.getByRole('button',{name:'Complete lesson · +10 XP'}).first().click();};
 async function quiz(answers){for(let i=0;i<5;i++){
  assert.match(await page.locator('.quiz-top').innerText(),new RegExp('QUESTION '+(i+1)+' OF 5'));
  // Submitting an unanswered question must not advance or award XP.
  await page.getByRole('button',{name:'Check answer',exact:true}).click();assert.equal(await page.locator('.quiz-top').count(),1);
  await page.locator('input[name=answer]').nth(answers[i]).check();await page.getByRole('button',{name:'Check answer',exact:true}).click();
  await page.getByRole('button',{name:i===4?'See my results':'Next question'}).click();
 }assert.equal(await page.locator('.quiz-top').count(),0);}
 await completeLessons();assert.match(await page.locator('#daily-goal-copy').innerText(),/Daily goal complete/);assert.equal(await page.locator('.achievement-card.earned').count(),1);
 await page.getByRole('button',{name:'Start 5-question quiz'}).click();await quiz([2,2,0,2,0]);
 assert.equal(await page.getByRole('button',{name:'Continue to next module'}).count(),0);assert.equal(await page.locator('#dashboard-xp').innerText(),'30');
 await page.getByRole('button',{name:'Try 5 questions again'}).click();await quiz([0,1,2,0,1]);
 assert.equal(await page.locator('#dashboard-xp').innerText(),'80');assert.equal(await page.locator('#journey-bar').getAttribute('value'),'25');
 await page.getByRole('button',{name:'Continue to next module'}).click();await page.reload();assert.equal(await page.locator('#learn-detail h3').innerText(),'Money Management');assert.equal(await page.locator('#dashboard-xp').innerText(),'80');
 await page.getByRole('button',{name:/Investing Basics/}).click();await page.getByRole('button',{name:'Review 5-question quiz'}).click();await quiz([0,1,2,0,1]);assert.equal(await page.locator('#dashboard-xp').innerText(),'80');
 await page.getByRole('button',{name:'Continue to next module'}).click();
 for(const [index,answers] of [[1,[0,1,0,0,0]],[2,[0,1,0,2,1]],[3,[1,2,0,0,1]]]){
  await completeLessons();await page.getByRole('button',{name:'Start 5-question quiz'}).click();await quiz(answers);
  if(index<3)await page.getByRole('button',{name:'Continue to next module'}).click();
 }
 assert.equal(await page.locator('#journey-bar').getAttribute('value'),'100');assert.equal(await page.locator('#dashboard-xp').innerText(),'320');assert.match(await page.locator('#learn-detail').innerText(),/All four modules complete/);assert.equal(await page.getByRole('button',{name:'Continue to next module'}).count(),0);
 console.log('PASS learning: unanswered guard, five questions, fail/retry, unlocks, retake XP, daily goal, achievements, full course, reload');
 await page.locator('#market-search').fill('Apple');assert.equal(await page.locator('#watchlist button').count(),1);await page.locator('#market-search').fill('no-such-stock');assert.equal(await page.locator('#market-search-empty').isVisible(),true);await page.locator('#market-search').fill('');
 await page.getByRole('button',{name:'5 shares',exact:true}).click();assert.equal(await page.locator('#quantity').inputValue(),'5');await page.locator('#order-form').getByRole('button',{name:'Buy shares',exact:true}).click();assert.match(await page.locator('#message').innerText(),/Order filled/);assert.match(await page.locator('#positions').innerText(),/AAPL/);assert.equal(await page.locator('#order-owned').innerText(),'5');
 const buyCash=await page.locator('#order-cash').innerText();await page.locator('#quantity').fill('100000');await page.locator('#submit').click();assert.match(await page.locator('#message').innerText(),/Insufficient/);assert.equal(await page.locator('#order-cash').innerText(),buyCash);
 await page.locator('#sell').click();await page.locator('#quantity').fill('6');await page.locator('#submit').click();assert.match(await page.locator('#message').innerText(),/cannot sell/);
 await page.locator('#quantity').fill('2');await page.locator('#submit').click();assert.equal(await page.locator('#order-owned').innerText(),'3');
 await page.locator('#history-filter').selectOption('sell');assert.equal(await page.locator('#history .trade-row').count(),1);assert.match(await page.locator('#history').innerText(),/SELL 2 AAPL/);await page.locator('#history-filter').selectOption('all');assert.equal(await page.locator('#history .trade-row').count(),2);
 await page.getByRole('button',{name:'Trade AAPL',exact:true}).click();assert.equal(await page.locator('#symbol').inputValue(),'AAPL');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.SCREENSHOT_DIR){await page.screenshot({path:process.env.SCREENSHOT_DIR+'/sprout-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:process.env.SCREENSHOT_DIR+'/sprout-desktop.png',fullPage:true});}
 let quoteFailure=false;
 await page.route('**/api/quotes',route=>route.fulfill({status:quoteFailure?503:200,contentType:'application/json',body:JSON.stringify(quoteFailure?{error:'Test quote provider unavailable'}:{source:'Test provider',quotes:['AAPL','MSFT','NVDA','AMZN','GOOGL','TSLA'].map((symbol,i)=>({symbol,price:200+i,asOf:new Date().toISOString()}))})}));
 await page.locator('#price-mode').selectOption('real');await page.waitForFunction(()=>document.getElementById('quote-status').textContent.includes('Test provider'));assert.equal(await page.locator('#quote').innerText(),'$200.00');assert.equal((await page.locator('#chart').innerHTML()).includes('NaN'),false);
 quoteFailure=true;await page.locator('#refresh-quotes').click();await page.waitForFunction(()=>document.getElementById('quote-status').textContent.includes('Simulation resumed'));assert.equal(await page.locator('#price-mode').inputValue(),'simulation');
 console.log('PASS simulator: search, shortcuts, buy, overspending, overselling, sell, holdings, filters, mobile overflow');
 // Exercise authenticated client behavior against a deterministic API contract without using a real account.
 const uid='00000000-0000-4000-8000-000000000001';let remoteProgress={completed:{},passed:{},xp:0,activityDays:[]},failSave=false,writes=0;
 await page.route('https://kbphftwnggadpfbyctve.supabase.co/**',async route=>{
  const request=route.request(),url=new URL(request.url());let body={},status=200;
  if(url.pathname==='/auth/v1/token')body={access_token:'test-token',refresh_token:'test-refresh',expires_in:3600,user:{id:uid,email:'test@example.invalid'}};
  else if(url.pathname==='/auth/v1/logout')body={};
  else if(url.pathname==='/rest/v1/paper_accounts')body=request.method()==='GET'?[{account:{cash:10000,positions:{},trades:[]}}]:{};
  else if(url.pathname==='/rest/v1/learning_progress'){
   assert.equal(request.headers().authorization,'Bearer test-token');
   if(request.method()==='POST'){assert.equal(request.postDataJSON().user_id,uid);writes++;if(failSave){status=500;body={message:'Test save unavailable'};}else{remoteProgress=request.postDataJSON().progress;body={};}}
   else body=[{progress:remoteProgress}];
  }else if(url.pathname==='/rest/v1/leaderboard_profiles')body=[];
  else{status=404;body={message:'Unexpected test endpoint'};}
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 });
 async function login(){await page.locator('#email').fill('test@example.invalid');await page.locator('#password').fill('test-password-only');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForFunction(()=>document.getElementById('auth-message').textContent.includes('Portfolio synced'));}
 await login();assert.equal(await page.locator('#dashboard-xp').innerText(),'0');await page.getByRole('button',{name:'Complete lesson · +10 XP'}).first().click();await page.waitForFunction(()=>document.getElementById('learn-sync-status').textContent.includes('synced to your account'));assert.equal(remoteProgress.xp,10);assert.ok(Object.values(remoteProgress.dailyXP)[0]===10);
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForFunction(()=>document.getElementById('auth-message').textContent.startsWith('Guest mode'));assert.equal(await page.locator('#dashboard-xp').innerText(),'320');
 await login();assert.equal(await page.locator('#dashboard-xp').innerText(),'10');failSave=true;await page.getByRole('button',{name:'Complete lesson · +10 XP'}).first().click();await page.waitForFunction(()=>document.getElementById('learn-sync-status').textContent.includes('Learning save failed'));assert.equal(await page.getByRole('button',{name:'Complete lesson · +10 XP'}).first().isDisabled(),true);assert.equal(remoteProgress.xp,10);assert.equal(writes,2);
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForFunction(()=>document.getElementById('auth-message').textContent.startsWith('Guest mode'));assert.equal(await page.locator('#dashboard-xp').innerText(),'320');
 assert.deepEqual(errors,[]);console.log('PASS account API contract: isolated guest/cloud progress, authenticated save, re-login, failure disables changes, no browser errors');
}finally{await browser?.close();server?.kill();}
