import {test,expect} from './fixtures';
import {learningModules} from '../lib/billing/curriculum';
import {lessons} from '../lib/education';
import {presentationQuestions} from '../lib/education/presentation';

test('restores all original modules, lessons and learning resources',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Learn Trading the Simple Way.'})).toBeVisible();
 await expect(page.getByRole('progressbar',{name:'Course lessons completed'})).toHaveAttribute('max','159');
 await page.goto('/learn?view=Modules');
 await expect(page.getByText('159 lessons · 41 modules',{exact:true})).toBeVisible();
 const moduleTitles:string[]=[];
 for(let i=0;i<7;i++){
  moduleTitles.push(...await page.locator('.compact-module-grid h3').allTextContents());
  if(i<6)await page.getByRole('button',{name:'Next',exact:true}).click();
 }
 expect(moduleTitles).toEqual(learningModules.map(m=>m.title));
 await page.goto('/learn?view=Lessons');
 const titles:string[]=[];
 for(let i=0;i<20;i++){
  titles.push(...await page.locator('.compact-lesson-grid button strong').allTextContents());
  if(i<19)await page.getByRole('button',{name:'Next',exact:true}).click();
 }
 expect(titles).toEqual(lessons.map(l=>l.title));
 await page.goto('/learn?view=Glossary');await expect(page.locator('.glossary-grid')).toBeVisible();
 await page.goto('/learn?view=Tutorials');await expect(page.locator('.onboarding-video-grid')).toBeVisible();
 await page.goto('/practice');await expect(page.getByRole('heading',{name:'Your practice lab'})).toBeVisible();
 await expect(page.locator('.locked-lab')).toHaveCount(6);
});

test('module quiz stops at five, saves completion and continues into the next original module',async({page})=>{
 await page.goto('/learn?view=Modules');
 const first=page.locator('.compact-module-grid details').first();await first.locator('summary').click();await first.getByRole('button',{name:'Start module quiz'}).click();
 const d=page.getByRole('dialog');
 const group=lessons.filter(l=>learningModules[0].ids.includes(l.id));
 for(let i=1;i<group.length;i++)await d.getByRole('button',{name:'Next slide'}).click();
 await d.getByRole('button',{name:'Start quiz'}).click();
 const questions=presentationQuestions(group);
 for(let i=0;i<5;i++){
  await expect(d).toContainText(`Quiz · Question ${i+1} / 5`);
  await expect(d.getByRole('button',{name:'Check answer',exact:true})).toBeDisabled();
  await d.locator('.quiz-options button').nth(questions[i].answer).click();await d.getByRole('button',{name:'Check answer',exact:true}).click();
  await d.getByRole('button',{name:i===4?'Finish quiz':'Next question',exact:true}).click();
 }
 await expect(d.getByRole('heading',{name:'Module complete!',exact:true})).toBeVisible();
 await expect(d.locator('.quiz-options')).toHaveCount(0);
 await expect(d).toContainText('Quiz score: 100%');
 await d.getByRole('button',{name:'Continue to next module',exact:true}).click();
 await expect(d.getByRole('heading',{name:learningModules[1].title,exact:true,level:2})).toBeVisible();
 await d.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.reload();await expect(page.locator('.compact-module-grid details').first()).toContainText('4/4 complete');
});

test('original quiz layout stays compact and fits phone screens',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/learn?lesson=1');
 const d=page.getByRole('dialog');await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Start quiz'}).click();
 for(const answer of await d.locator('.quiz-options button').all())await expect(answer).toBeInViewport({ratio:1});
 await expect(d.getByRole('button',{name:'Check answer',exact:true})).toBeInViewport({ratio:1});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
