import {test,expect} from './fixtures';
test('learning has one consistent experience with five-question quizzes',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await page.getByRole('heading',{name:/Account overview/}).waitFor();await page.goto('/learn');await expect(page.getByRole('combobox',{name:'Learning mode'})).toHaveCount(0);await page.goto('/learn?lesson=60');const d=page.getByRole('dialog');await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Start quiz'}).click();await expect(d).toContainText('1 / 5');await expect(d).toContainText('80%');
});
