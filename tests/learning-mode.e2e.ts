import {test,expect} from './fixtures';
test('learning modes persist and change presentation depth and quiz difficulty',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await page.getByRole('heading',{name:/Account overview/}).waitFor();
 for(const mode of ['intermediate','advanced','beginner']){
 await page.goto('/learn');await page.getByRole('combobox',{name:'Learning mode'}).selectOption(mode);await page.reload();await expect(page.getByRole('combobox',{name:'Learning mode'})).toHaveValue(mode);await page.goto('/learn?lesson=60');const d=page.getByRole('dialog');await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Next slide'}).click();if(mode==='beginner')await expect(d).not.toContainText('DEEPER ANALYSIS');else await expect(d).toContainText(mode==='advanced'?'DEEPER ANALYSIS':'MODULE CONNECTIONS');await d.getByRole('button',{name:'Start quiz'}).click();await expect(d).toContainText('1 / 5');await d.locator('.quiz-options button').nth(1).click();await d.getByRole('button',{name:'Check answer'}).click();await d.getByRole('button',{name:'Next question'}).click();if(mode==='advanced')await expect(d.locator('.quiz-options button')).toHaveCount(4);
 }
});
