import {test,expect} from "./fixtures";
import {initialState} from "../lib/trading";
test("signed-in learners can publish discussions, reviews, and portfolio snapshots",async({page})=>{
 const id="00000000-0000-4000-8000-000000000001";
 const user={id,email:"learner@example.com",aud:"authenticated",role:"authenticated",created_at:new Date().toISOString()};
 const token=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600,aud:"authenticated"})).toString('base64url')+'.test';
 const state=initialState();state.profile={...state.profile,id,name:"Taylor",onboarded:true};
 const posts:Record<string,unknown>[]=[],reviews:Record<string,unknown>[]=[],portfolios:Record<string,unknown>[]=[];
 await page.route('**/auth/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(new URL(r.request().url()).pathname.endsWith('user')?user:{access_token:token,refresh_token:"test",token_type:"bearer",expires_in:3600,user})}));
 await page.route('**/rest/v1/**',async r=>{
  const request=r.request(),url=new URL(request.url()),table=url.pathname.split('/').at(-1);
  let data:unknown=[];
  if(table==='paper_accounts')data=[{account:state,updated_at:'2026-10-06T00:00:00Z'}];
  else if(table==='community_posts'){
   if(request.method()==='POST')posts.push({...request.postDataJSON(),id:'post-1',created_at:'2026-10-06T00:00:00Z'});
   else data=posts.filter(p=>`eq.${p.kind}`===url.searchParams.get('kind'));
  }else if(table==='learner_reviews'){
   if(request.method()==='POST'){reviews.splice(0,reviews.length,{...request.postDataJSON()});}
   else data=reviews;
  }else if(table==='community_portfolios'){
   if(request.method()==='POST')portfolios.push({...request.postDataJSON()});else data=portfolios;
  }
  await r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('/');
 const auth=page.getByRole('region',{name:'Account sign-in'});
 await auth.getByLabel('Email',{exact:true}).fill(user.email);await auth.getByLabel('Password',{exact:true}).fill('test-password-123');await auth.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByText('Cloud account',{exact:true})).toBeVisible();
 await page.goto('/community');
 await page.getByRole('textbox',{name:'Community post title'}).fill('How I plan a trade');
 await page.getByRole('textbox',{name:'Community post body'}).fill('I consider the entry, size, possible loss, and exit plan.');
 await page.getByRole('button',{name:'Publish post',exact:true}).click();
 await expect(page.locator('.community-post')).toContainText('How I plan a trade');
 expect(posts[0].user_id).toBe(id);
 await page.getByRole('button',{name:'Leaderboards',exact:true}).click();
 await page.getByRole('button',{name:'Share my portfolio amount'}).click();
 await expect(page.getByRole('table',{name:'Virtual portfolio leaderboard'})).toContainText('$10,000.00');
 expect(portfolios[0].equity).toBe(10000);
 await page.getByRole('textbox',{name:'Your Sprout review'}).fill('The chart examples helped me understand what the prices mean.');
 await page.getByRole('combobox',{name:'Review rating'}).selectOption('4');
 await expect(page.getByRole('button',{name:'Publish my review'})).toBeDisabled();
 await page.getByRole('checkbox',{name:/This is my own experience/}).check();
 await page.getByRole('button',{name:'Publish my review'}).click();
 await expect(page.locator('.review-card')).toContainText('The chart examples helped');
 expect(reviews[0].rating).toBe(4);expect(reviews[0].consent).toBe(true);expect(reviews[0].user_id).toBe(id);
});
