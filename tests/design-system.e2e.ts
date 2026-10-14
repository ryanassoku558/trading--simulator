import {test,expect} from './fixtures';
import {readFile} from 'node:fs/promises';
test('standard lesson supports inline definitions and saves a passed quiz',async({page})=>{
 await page.goto('/learn?lesson=1');
 const lesson=page.getByRole('dialog').first();
 await expect(lesson.getByRole('heading',{name:'Key concepts'})).toBeVisible();
 await lesson.getByRole('button',{name:'Define Stock',exact:true}).first().click();
 const term=page.getByRole('dialog',{name:'Stock',exact:true});
 await expect(term).toContainText('ownership interest');
 await term.getByRole('button',{name:'Back to lesson'}).click();
 await lesson.getByRole('button',{name:'Next slide'}).click();
 await expect(lesson.getByRole('heading',{name:'Worked example',exact:true})).toBeVisible();
 await lesson.getByRole('button',{name:'Next slide'}).click();
 await expect(lesson.getByRole('heading',{name:'Practice prompt'})).toBeVisible();
 await expect(lesson.getByRole('heading',{name:'Summary',exact:true})).toBeVisible();
 await lesson.getByRole('button',{name:'Start quiz'}).click();
 for(let i=0;i<5;i++){
  await expect(lesson.getByRole('button',{name:'Check answer'})).toBeInViewport({ratio:1});
  await lesson.locator('.quiz-options button').nth(i===0?0:1).click();
  await lesson.getByRole('button',{name:'Check answer'}).click();
  await lesson.getByRole('button',{name:i===4?'Finish quiz':'Next question'}).click();
 }
 await expect(lesson.getByRole('heading',{name:'Lesson complete!'})).toBeVisible();
 await lesson.getByRole('button',{name:'Return to dashboard'}).click();
 await expect(page.getByRole('navigation',{name:'Getting started path'}).locator('a.done')).toHaveCount(1);
});
test('retention has real goals and opt-in calendar reminders',async({page})=>{
 await page.goto('/achievements');
 await page.getByRole('button',{name:'Habits & goals'}).click();
 await expect(page.getByRole('heading',{name:'Practice with a purpose'})).toBeVisible();
 await expect(page.getByText('0 achievements earned.')).toBeVisible();
 await page.getByLabel('Daily reminder time').fill('10:30');
 const downloading=page.waitForEvent('download');
 await page.getByRole('button',{name:'Add daily calendar reminder'}).click();
 const file=await downloading;expect(file.suggestedFilename()).toBe('sprout-learning-reminder.ics');
 const text=await readFile((await file.path())!,'utf8');
 expect(text).toContain('RRULE:FREQ=DAILY');expect(text).toMatch(/DTSTART:\d{8}T103000/);expect(text).toContain('https://sprout-trading.vercel.app/learn');
 await expect(page.getByRole('status')).toContainText('Import it into your calendar');
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Mobile navigation'});
 await expect(nav.getByRole('link')).toHaveCount(6);await expect(nav.getByRole('link',{name:'Home',exact:true})).toHaveAttribute('aria-current','page');
 await nav.getByRole('link',{name:'Glossary',exact:true}).click();await expect(page.getByLabel('Search trading glossary')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
