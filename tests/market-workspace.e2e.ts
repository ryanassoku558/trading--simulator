import { test, expect } from "./fixtures";
test("global search, sorting, and both market layouts work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the Simulator" }).click();
  await page.getByRole("textbox", { name: "Search the market" }).fill("AAPL");
  await page.getByRole("button", { name: "Submit market search" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search stocks" }),
  ).toHaveValue("AAPL");
  await expect(page.locator(".market-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search the market" }).fill("NVDA");
  await page.getByRole("button", { name: "Submit market search" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search stocks" }),
  ).toHaveValue("NVDA");
  await expect(page.locator(".market-card")).toContainText("NVDA");
  await page.getByRole("textbox", { name: "Search stocks" }).fill("");
  await page
    .getByRole("combobox", { name: "Sort market" })
    .selectOption("price");
  const prices = await page.locator(".quote-cell").allTextContents();
  const values = prices.map(p => Number(p.replace(/[^0-9.]/g, "")));
  expect(values).toEqual([...values].sort((a,b) => b-a));
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.locator(".market-grid .market-card")).toHaveCount(50);
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Simulated stock market" }),
  ).toBeVisible();
});
