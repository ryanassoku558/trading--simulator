import {test,expect} from './fixtures';
import {lessons} from '../lib/education';
import {learningModules} from '../lib/billing/curriculum';
import {presentationQuestions} from '../lib/education/presentation';

test('existing homepage shows module steps and earned milestone feedback',async({page})=>{
 await page.goto('/dashboard');
 await expect(page.getByRole('heading',{name:/Build knowledge/})).toBeVisible();
 const steps=page.getByRole('navigation',{name:'Market Basics lesson steps'});
 await expect(steps.getByRole('link')).toHaveCount(4);
 await expect(steps.getByRole('link').first()).toHaveAttribute('aria-current','step');
 await expect(page.locator('.home-milestone-note')).toContainText('Next: First Lesson');
 await expect(page.getByRole('progressbar',{name:'Course lessons completed'})).toHaveAttribute('max','199');
});

test('five-question feedback finishes once and retakes preserve XP',async({page})=>{
 const group=lessons.filter(l=>learningModules[0].ids.includes(l.id));const questions=presentationQuestions(group);
 const open=async()=>{await page.goto('/learn?view=Modules');const module=page.locator('.compact-module-grid details').first();await module.locator('summary').click();await module.getByRole('button',{name:'Start module quiz'}).click();const d=page.getByRole('dialog');for(let i=1;i<group.length;i++)await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Start quiz'}).click();return d;};
 let d=await open();
 for(let i=0;i<5;i++){
  await expect(d.getByRole('group',{name:'Five-question progress'}).locator('span')).toHaveCount(5);
  await expect(d).toContainText(`Question ${i+1} / 5`);
  await d.locator('.quiz-options button').nth(questions[i].answer).click();await d.getByRole('button',{name:'Check answer',exact:true}).click();
  await expect(d.locator('.quiz-options button.correct-answer')).toHaveCount(1);
  await expect(d.locator('.quiz-question-steps .step-correct')).toHaveCount(i+1);
  await d.getByRole('button',{name:i===4?'Finish quiz':'Next question',exact:true}).click();
 }
 await expect(d.getByRole('heading',{name:'Module complete!',exact:true})).toBeVisible();
 await expect(d.locator('.quiz-next-module')).toContainText('Up next: Candlesticks');
 await expect(d.locator('.quiz-options')).toHaveCount(0);
 await d.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.goto('/dashboard');
 await expect(page.locator('.home-module-steps .step-complete')).toHaveCount(0); // the next module is now recommended
 await expect(page.locator('.home-milestone-note')).toContainText('1 milestone earned');
 await expect(page.getByRole('link',{name:'Continue Learning',exact:true})).toBeVisible();
 const xpBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('sprout-trading-v1')!).learning.xp);
 d=await open();
 for(let i=0;i<5;i++){await d.locator('.quiz-options button').nth(questions[i].answer).click();await d.getByRole('button',{name:'Check answer',exact:true}).click();await d.getByRole('button',{name:i===4?'Finish quiz':'Next question',exact:true}).click();}
 await expect(d.getByRole('heading',{name:'Module complete!',exact:true})).toBeVisible();
 const xpAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('sprout-trading-v1')!).learning.xp);expect(xpAfter).toBe(xpBefore);
});

test('order panel adds cash context and quantity shortcuts without changing the trading workflow',async({page})=>{
 await page.goto('/market/AAPL');
 const panel=page.locator('.trade-panel');
 await expect(panel.getByRole('definition').first()).toContainText('$10,000.00');
 await panel.getByRole('button',{name:'5 shares',exact:true}).click();await expect(panel.getByRole('spinbutton',{name:'Number of shares'})).toHaveValue('5');
 await panel.getByRole('button',{name:'Review buy AAPL',exact:true}).click();
 const review=page.getByRole('dialog',{name:'Review your practice trade'});await expect(review).toBeVisible();await review.getByRole('button',{name:'Confirm buy',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Close dialog',exact:true}).click();
 await expect(panel.getByRole('definition').first()).not.toContainText('$10,000.00');
 await panel.getByRole('button',{name:'Sell',exact:true}).click();await expect(panel.getByRole('button',{name:'Sell',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('quiz dialog fits its question instead of leaving a large empty area',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/learn?lesson=1');const d=page.getByRole('dialog');await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Start quiz'}).click();
 const dialog=await d.boundingBox(),footer=await d.locator('.lesson-footer').boundingBox();
 expect(dialog!.y+dialog!.height-footer!.y-footer!.height).toBeLessThan(30);
 await expect(d.getByRole('button',{name:'Check answer',exact:true})).toBeInViewport({ratio:1});
});
