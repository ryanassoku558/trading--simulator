import {test,expect} from './fixtures';
test('finance topics can be searched and completed to earn a mastery badge',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await page.getByRole('heading',{name:/Account overview/}).waitFor();await page.goto('/learn');
 await page.getByRole('button',{name:'Personal finance',exact:true}).click();await expect(page.getByText('40 matching lessons', {exact:false})).toBeVisible();
 await page.getByRole('searchbox',{name:'Search lessons'}).fill('starting');await page.getByRole('button',{name:/Starting with the amount that fits you/}).click();await expect(page.getByRole('dialog')).toContainText('There is no single amount');await page.getByRole('button',{name:'Close dialog'}).click();
 for(const id of [60,61,62,63]){await page.goto(`/learn?lesson=${id}`);const d=page.getByRole('dialog');await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Next slide'}).click();await d.getByRole('button',{name:'Start quiz'}).click();await d.locator('.quiz-options button').nth(1).click();await d.getByRole('button',{name:'Check answer'}).click();await expect(d.getByText('Nice work. You’ve understood this idea.')).toBeVisible();await d.getByRole('button',{name:'Finish quiz'}).click();await expect(d.getByRole('heading',{name:/complete!/})).toBeVisible();}
 await page.goto('/achievements');await expect(page.locator('.achievement.unlocked').filter({has:page.getByRole('heading',{name:'Financial Foundations',exact:true})})).toBeVisible();
});
test('Sprouty gives sourced automated help on mobile and opens a relevant lesson',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Ask Sprouty',exact:true}).click();const chat=page.getByRole('dialog',{name:'Sprouty help chat'});
 await chat.getByRole('button',{name:'How much money do I need to start?',exact:true}).click();await expect(chat.locator('.help-message.assistant').last()).toContainText('no single amount');
 await chat.getByRole('textbox',{name:'Ask Sprouty a question'}).fill('What is compound interest?');await chat.getByRole('button',{name:'Send question to Sprouty'}).click();await expect(chat.locator('.help-message.assistant').last()).toContainText('Compounding');
 await chat.getByRole('textbox',{name:'Ask Sprouty a question'}).fill('Give me an example');await chat.getByRole('button',{name:'Send question to Sprouty'}).click();await expect(chat.locator('.help-message.assistant').last()).toContainText('$1,102.50');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await chat.locator('.help-message.assistant').last().getByRole('button',{name:'Compound interest can help or hurt'}).click();await expect(page.getByRole('dialog')).toContainText('Compound interest can help or hurt');
});
