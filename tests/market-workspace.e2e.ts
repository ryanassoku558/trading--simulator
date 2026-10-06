import { test, expect } from "@playwright/test";
test("global search, sorting, and both market layouts work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore Demo" }).click();
  await page.getByRole("textbox", { name: "Search the market" }).fill("apple");
  await page.getByRole("button", { name: "Submit market search" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search stocks" }),
  ).toHaveValue("apple");
  await expect(page.locator(".market-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search the market" }).fill("nvidia");
  await page.getByRole("button", { name: "Submit market search" }).click();
  await expect(
    page.getByRole("textbox", { name: "Search stocks" }),
  ).toHaveValue("nvidia");
  await expect(page.locator(".market-card")).toContainText("NVDA");
  await page.getByRole("textbox", { name: "Search stocks" }).fill("");
  await page
    .getByRole("combobox", { name: "Sort market" })
    .selectOption("price");
  await expect(page.locator(".market-card").first()).toContainText("NFLX");
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.locator(".market-grid .market-card")).toHaveCount(10);
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Simulated stock market" }),
  ).toBeVisible();
});
