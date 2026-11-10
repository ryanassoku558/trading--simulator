import {test,expect} from './fixtures';
import {initialState} from '../lib/trading';
test('signed-in users see their code and redeem a code with server confirmation',async({page})=>{
 const id='00000000-0000-4000-8000-000000000003',user={id,email:'test@example.com',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString()};
 const token=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated'})).toString('base64url')+'.test';
 const state=initialState();state.profile={...state.profile,id,name:'Taylor',onboarded:true};let redeemed=false;
 await page.route('**/auth/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(new URL(r.request().url()).pathname.endsWith('user')?user:{access_token:token,refresh_token:'test',token_type:'bearer',expires_in:3600,user})}));
 await page.route('**/rest/v1/paper_accounts**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify([{account:state,updated_at:'2026-10-06T00:00:00Z'}])}));
 await page.route('**/rest/v1/rpc/sprout_referral_status',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({code:'ABCDEF123456',friends:1,bonus:10000,redeemed})}));
 await page.route('**/rest/v1/rpc/sprout_redeem_referral',r=>{expect(r.request().postDataJSON().input_code).toBe('FRIEND123456');redeemed=true;return r.fulfill({contentType:'application/json',body:'{"awarded":10000}'});});
 await page.goto('/');const auth=page.getByRole('region',{name:'Account sign-in'});await auth.getByLabel('Email',{exact:true}).fill(user.email);await auth.getByLabel('Password',{exact:true}).fill('test-password-123');await auth.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByText('Cloud account',{exact:true})).toBeVisible();
 const referral=page.locator('#referrals');await expect(referral).toContainText('ABCDEF123456');await expect(referral).toContainText('1 friend · $10,000.00 virtual bonus awarded');await referral.getByLabel('Have a friend’s code?').fill('friend123456');await referral.getByRole('button',{name:'Redeem code'}).click();await expect(referral).toContainText('Your friend received $10,000.00 in virtual cash');await expect(referral.getByRole('button',{name:'Redeem code'})).toHaveCount(0);
});
