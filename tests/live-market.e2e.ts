import {test, expect} from "@playwright/test";
test("automatic quotes and candles move without saving account ticks", async ({page}) => {
 await page.clock.setFixedTime(new Date("2026-10-06T00:00:00Z"));
 await page.goto("/");
 await page.getByRole("button", {name:"Try the Simulator"}).click();
 await page.goto("/market/VTI");
 await page.getByRole("button", {name:"Candlesticks", exact:true}).click();
 await expect(page.locator(".stock-detail-price")).toHaveText("$280.00");
 const old = await page.locator(".candle-values").textContent();
 await page.clock.setFixedTime(new Date("2026-10-06T00:00:20Z"));
 await expect(page.locator(".stock-detail-price")).not.toHaveText("$280.00");
 await expect(page.locator(".candle-values")).not.toHaveText(old!);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("sprout-trading-v1")!).tick)).toBe(0);
});
test("automatically fills pending ETF orders on a new clock tick", async ({page}) => {
 await page.clock.setFixedTime(new Date("2026-10-06T00:00:00Z"));
 await page.goto("/");
 await page.getByRole("button", {name:"Try the Simulator"}).click();
 await page.evaluate(() => {
  const key="sprout-trading-v1", state=JSON.parse(localStorage.getItem(key)!);
  state.orders=[{id:"auto-etf",ticker:"VTI",side:"buy",shares:1,limit:300,status:"pending",date:new Date().toISOString()}];
  localStorage.setItem(key,JSON.stringify(state));
 });
 await page.goto("/market/VTI");
 await page.clock.setFixedTime(new Date("2026-10-06T00:00:02Z"));
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("sprout-trading-v1")!).orders[0].status)).toBe("filled");
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem("sprout-trading-v1")!));
 expect(state.holdings[0].ticker).toBe("VTI");
 expect(state.cash).toBe(10000-state.trades[0].total);
});
