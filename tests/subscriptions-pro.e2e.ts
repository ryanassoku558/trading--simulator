import {test,expect} from './fixtures';
import {initialState} from '../lib/trading';
const user={id:'11111111-1111-1111-1111-111111111111',email:'learner@example.com',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{first_name:'Learner'},created_at:'2026-10-01T00:00:00Z'};
test.beforeEach(async({page})=>{
 const account={...initialState(),profile:{...initialState().profile,id:user.id,name:'Learner',onboarded:true}};
 await page.addInitScript(({user})=>{localStorage.setItem('sb-kbphftwnggadpfbyctve-auth-token',JSON.stringify({access_token:'test-session',refresh_token:'test-refresh',expires_at:4102444800,expires_in:3600,token_type:'bearer',user}));},{user});
 await page.route('**/auth/v1/user**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(user)}));
 await page.route('**/rest/v1/paper_accounts**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().method()==='GET'?[{account,updated_at:'2026-10-06T00:00:00Z'}]:[{updated_at:'2026-10-06T00:00:01Z'}])}));
 await page.route('**/api/billing/status',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({pro:true,ready:true})}));
});
test('verified account status unlocks full curriculum, tools, replay and mode controls',async({page})=>{
 await page.goto('/tools');await expect(page.getByRole('heading',{name:'Your trading tools'})).toBeVisible();await expect(page.getByRole('slider',{name:'Hypothetical exit price'})).toBeVisible();
 await page.goto('/learn?lesson=151');await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();
 await page.goto('/market');await page.getByRole('button',{name:'High-Volatility Mode',exact:true}).click();await expect(page.getByRole('button',{name:'High-volatility · 4× movement speed'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Replay Mode',exact:true}).click();await expect(page.getByRole('heading',{name:'Your practice lab'})).toBeVisible();
 await page.goto('/pricing');await expect(page.getByRole('button',{name:'Manage subscription',exact:true})).toBeEnabled();await expect(page.getByRole('heading',{name:'Priority support request'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Save your progress',exact:true})).toHaveCount(0);
});
test('personal referral code edits persist and stale legacy rewards are hidden',async({page})=>{
 let saved='LEARN_WITH_ME';await page.route('**/rest/v1/rpc/sprout_referral_status',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({version:2,code:saved,friends:2,redeemed:false})}));
 await page.route('**/rest/v1/rpc/sprout_customize_referral',r=>{const body=r.request().postDataJSON();saved=body.input_code;return r.fulfill({contentType:'application/json',body:JSON.stringify(saved)});});
 await page.goto('/profile');await expect(page.getByRole('heading',{name:'Your code. Their first $5,000 bonus.'})).toBeVisible();await page.getByRole('textbox',{name:'Personal referral code'}).fill('GROW_WITH_RYAN');await page.getByRole('button',{name:'Save code',exact:true}).click();await expect(page.getByText('Your personal code is saved. Share it with a new learner.')).toBeVisible();expect(saved).toBe('GROW_WITH_RYAN');
});
