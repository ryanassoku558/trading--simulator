import {test,expect} from './fixtures';
test('public pricing explains every benefit and never pretends checkout is connected',async({page})=>{
 await page.goto('/pricing');await expect(page.getByRole('heading',{name:'A small step. A stronger foundation.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Payments coming soon'})).toBeDisabled();
 for(const name of ['Strategy Labs','Psychology training','Quizzes','Resets','Recharges','Analytics','High-Volatility Mode','Replay Mode','Daily market warm-up','Community challenges','Badges & mastery levels','Sprouty guidance','Support'])await expect(page.getByRole('rowheader',{name,exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'Build your foundation'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Starter receives twenty lessons and cannot open a paid lesson or reset',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await expect(page.getByRole('heading',{name:'Account overview.'})).toBeVisible();
 await page.goto('/learn');await expect(page.getByRole('heading',{name:'Market Basics',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Volume & Volatility',exact:true})).toBeVisible();await expect(page.locator('.level:not(.locked-module)')).toHaveCount(5);await expect(page.locator('.lesson-row:not(.locked-lesson)')).toHaveCount(20);await expect(page.locator('.locked-module')).toHaveCount(1);await page.locator('.locked-module .module-lessons summary').click();await page.locator('.locked-lesson').first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:/Show all modules/}).click();await expect(page.locator('.locked-module')).toHaveCount(34);
 await page.goto('/learn?lesson=151');await expect(page.getByRole('heading',{name:'This lesson is part of Sprout Pro.'})).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.goto('/market');await page.getByRole('button',{name:'Unlock resets',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByText('Unlimited simulator resets is included with Sprout Pro.')).toBeVisible();
 await page.getByRole('button',{name:'Close dialog'}).click();await page.goto('/tools');await expect(page.getByRole('heading',{name:'All trading tools',exact:true})).toBeVisible();await expect(page.getByRole('spinbutton',{name:'Calculator practice budget'})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Volatility meter',exact:true})).toHaveCount(0);await expect(page.getByRole('slider',{name:'Hypothetical exit price'})).toHaveCount(0);
});
test('billing endpoints reject unconfigured checkout, invalid webhooks and unauthenticated money actions',async({request})=>{
 const checkout=await request.post('/api/billing/checkout',{data:{plan:'pro',price:1}});expect(checkout.status()).toBe(503);
 const status=await request.get('/api/billing/status');expect(await status.json()).toEqual({pro:false,ready:false});
 const webhook=await request.post('/api/billing/webhook',{data:{type:'checkout.session.completed'}});expect(webhook.status()).toBe(400);
 const action=await request.post('/api/billing/simulator',{data:{action:'recharge'}});expect(action.ok()).toBe(false);
});
