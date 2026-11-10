import {test,expect} from './fixtures';
test('lesson navigation and all quiz answers fit desktop and phone screens',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await page.getByRole('heading',{name:/Account overview/}).waitFor();
 for(const viewport of [{width:1366,height:768},{width:375,height:667}]){
 await page.setViewportSize(viewport);await page.goto('/learn?lesson=60');const d=page.getByRole('dialog');
 for(let i=0;i<2;i++){const next=d.getByRole('button',{name:'Next slide'});await expect(next).toBeInViewport({ratio:1});await next.click();}
 await expect(d.getByRole('button',{name:'Start quiz'})).toBeInViewport({ratio:1});await d.getByRole('button',{name:'Start quiz'}).click();
 for(let i=0;i<5;i++){for(const answer of await d.locator('.quiz-options button').all())await expect(answer).toBeInViewport({ratio:1});await expect(d.getByRole('button',{name:'Check answer'})).toBeInViewport({ratio:1});await d.locator('.quiz-options button').nth(1).click();await d.getByRole('button',{name:'Check answer'}).click();const next=d.getByRole('button',{name:i===4?'Finish quiz':'Next question'});await expect(next).toBeInViewport({ratio:1});await next.click();}await expect(d.getByRole('heading',{name:'Lesson complete!'})).toBeVisible();
 }
});
