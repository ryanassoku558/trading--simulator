import { test, expect } from "./fixtures";
test("candlestick toggle, OHLC inspection and timeframe changes work on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore Demo" }).click();
  await page.goto("/market/AAPL");
  await page.getByRole("button", { name: "Candlesticks", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Simulated candlestick/ }),
  ).toBeVisible();
  await expect(page.locator(".candle-values")).toContainText("Period 40");
  await page.getByRole("slider", { name: "Candle period" }).focus();
  await page.getByRole("slider", { name: "Candle period" }).press("Home");
  const values = await page.locator(".candle-values").textContent();
  await page.getByRole("button", { name: "1Y", exact: true }).click();
  await expect(page.locator(".candle-values")).not.toHaveText(values!);
  const slider = page.getByRole("slider", { name: "Candle period" });
  await slider.focus();
  await slider.press("Home");
  await expect(page.locator(".candle-values")).toContainText("Period 1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Line chart", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Value over time" }),
  ).toBeVisible();
});
test("candle lessons open from a stock chart and quiz progress persists", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore Demo" }).click();
  await page.goto("/market/AAPL");
  await page.getByRole("button", { name: "Candlesticks", exact: true }).click();
  await page.getByRole("link", { name: "Learn to read candlesticks" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Candle bodies and wicks" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: /Simulated candlestick/ }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "B $100 and $105", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Check answer" }).click();
  await expect(dialog.getByRole("status")).toContainText("Correct!");
  await page.reload();
  await expect(page.getByText("1 / 54 lessons")).toBeVisible();
});
