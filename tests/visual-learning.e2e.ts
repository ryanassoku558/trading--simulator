import {test,expect} from './fixtures';
test('homepage chart slider, calculators, roadmap, and strategy links work',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Grow Your Trading Skills With Confidence'})).toBeVisible();
 const slider=page.getByRole('slider',{name:'Before and after chart outcome'});await slider.fill('24');await expect(page.getByText('9 periods later')).toBeVisible();
 await page.getByRole('spinbutton',{name:'Calculator practice budget'}).fill('1000');await page.getByRole('slider',{name:'Risk percentage'}).fill('2');await expect(page.locator('.tool-number').first()).toContainText('10');
 await page.getByRole('button',{name:'Continue Indicators'}).click();await expect(page.getByRole('dialog')).toContainText('Moving averages: smoothing the noise');await page.getByRole('button',{name:'Close dialog'}).click();
 await page.goto('/practice?scenario=1');await expect(page.getByRole('combobox',{name:'Replay scenario'})).toHaveValue('1');
});
test('mood tracking and portfolio goals persist and render in dark mode on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Try the Simulator',exact:true}).click();await page.goto('/tools');
 await page.getByRole('button',{name:'Tilt',exact:true}).click();await page.getByRole('button',{name:'Save mood check-in'}).click();await expect(page.getByRole('heading',{name:'Tilt Warning'})).toBeVisible();
 await page.getByRole('button',{name:'Switch to dark mode'}).click();await page.reload();await expect(page.getByRole('heading',{name:'Tilt Warning'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto('/practice');await page.getByRole('button',{name:'Start portfolio goal'}).click();await page.reload();await expect(page.getByRole('button',{name:'End portfolio goal'})).toBeVisible();await expect(page.getByRole('progressbar',{name:'Virtual portfolio return goal'})).toHaveAttribute('value','0');
});
