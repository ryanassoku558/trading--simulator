import {test,expect} from './fixtures';
import {initialState} from '../lib/trading';
test('Sprouty uses calm onboarding guidance and grows with saved lessons',async({page})=>{
 await page.goto('/');await expect(page.locator('.sprouty-plant').first()).toHaveAttribute('data-stage','0');
 await page.getByRole('button',{name:'Start Learning',exact:true}).click();await expect(page.getByRole('dialog').getByRole('complementary',{name:'Sprouty learning companion'})).toContainText('We’ll start with what you know');await page.getByRole('button',{name:'Close dialog'}).click();
 const state=initialState();state.profile.onboarded=true;state.learning.completed=Array.from({length:30},(_,i)=>i+1);
 await page.evaluate(s=>localStorage.setItem('sprout-trading-v1',JSON.stringify(s)),state);
 await page.goto('/learn');await expect(page.locator('.sprouty-plant').first()).toHaveAttribute('data-stage','3');await expect(page.getByRole('heading',{name:'You’re improving. Keep going.'})).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.sprouty-plant img').first().evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
});
