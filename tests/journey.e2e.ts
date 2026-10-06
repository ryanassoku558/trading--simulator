import { test, expect } from "@playwright/test";
test("first-run learning, trade, persistence, portfolio, orders and resets", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Learn trading. Build confidence. Skip the risk.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start Learning", exact: true })
    .click();
  await expect(
    page.getByText("How much do you know about trading?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create my practice space" }).click();
  await expect(
    page.getByText("Welcome! We’ll teach you trading from zero."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start with a lesson" }).click();
  await page.getByRole("button", { name: "What is a stock?" }).click();
  await page
    .getByRole("button", { name: "B A small piece of a company" })
    .click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Correct!",
  );
  await page
    .getByRole("button", { name: "Make your first practice trade" })
    .click();
  await expect(page).toHaveURL(/market\/AAPL/);
  await expect(page.getByText("Let’s buy your first share.")).toBeVisible();
  await page.getByRole("button", { name: "Review buy AAPL" }).click();
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(
    page.getByRole("heading", { name: "Explain My Trade" }),
  ).toBeVisible();
  await expect(page.getByText("You bought 1 share of AAPL.")).toBeVisible();
  await expect(page.getByText("Share price: $223.72")).toBeVisible();
  await page.getByRole("button", { name: "Got it · keep exploring" }).click();
  await page.reload();
  await expect(page.getByLabel("Number of shares")).toHaveValue("1");
  let state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sprout-trading-v1")!),
  );
  expect(state.cash).toBe(9786.93);
  expect(state.learning.completed).toEqual([1]);
  expect(state.learning.xp).toBe(85);
  expect(state.profile.onboarded).toBe(true);
  await page.getByRole("button", { name: "Sell", exact: true }).click();
  await page.getByRole("button", { name: "Review sell AAPL" }).click();
  await page.getByRole("button", { name: "Confirm sell" }).click();
  await expect(page.getByText("You sold 1 share of AAPL.")).toBeVisible();
  await page.getByRole("button", { name: "Got it · keep exploring" }).click();
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sprout-trading-v1")!),
  );
  expect(state.cash).toBe(10000);
  expect(state.holdings).toEqual([]);
  await page.getByRole("button", { name: "Review sell AAPL" }).click();
  await expect(page.locator(".trade-panel").getByRole("alert")).toContainText(
    "only sell shares you own",
  );
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByLabel("Number of shares").fill("1000");
  await page.getByRole("button", { name: "Review buy AAPL" }).click();
  await expect(page.locator(".trade-panel").getByRole("alert")).toContainText(
    "enough virtual cash",
  );
  await page.getByLabel("Number of shares").fill("1");
  await page.getByLabel("Order type").selectOption("limit");
  await page.getByLabel("Limit price").fill("220");
  await page.getByRole("button", { name: "Place limit order AAPL" }).click();
  await page.getByRole("button", { name: "Confirm limit order" }).click();
  await page.getByRole("button", { name: "Advance market" }).click();
  await expect(
    page.getByRole("heading", { name: "Explain My Trade" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Got it · keep exploring" }).click();
  for (const route of [
    "/",
    "/learn",
    "/market",
    "/portfolio",
    "/history",
    "/achievements",
    "/profile",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("/portfolio");
  await expect(
    page.getByRole("cell", { name: "AAPL", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "1", exact: true }),
  ).toBeVisible();
  await page.goto("/history");
  await page.getByRole("button", { name: "Explain My Trade" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Explain My Trade" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset simulator" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sprout-trading-v1")!),
  );
  expect(state.cash).toBe(10000);
  expect(state.trades).toEqual([]);
  expect(state.learning.completed).toEqual([1]);
  await page
    .getByRole("button", { name: "Reset learning", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sprout-trading-v1")!),
  );
  expect(state.learning.xp).toBe(0);
  expect(state.learning.completed).toEqual([]);
  await page.goto("/");
  await page.screenshot({ path: "/tmp/sprout-desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("mobile navigation, market search and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore Demo" }).click();
  for (const route of [
    "/",
    "/learn",
    "/market",
    "/market/AAPL",
    "/portfolio",
    "/history",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/market");
  await page.getByRole("textbox", { name: "Search stocks" }).fill("apple");
  await expect(page.locator(".market-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search stocks" }).fill("unlisted");
  await expect(
    page.getByRole("heading", { name: "No stocks found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your learning journey" }),
  ).toBeVisible();
  await page.goto("/");
  await page.screenshot({ path: "/tmp/sprout-mobile.png", fullPage: true });
});

test("recovers from corrupt saved data and labels keyboard-accessible dialogs", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "sprout-trading-v1",
      JSON.stringify({ cash: 10000, holdings: [{ ticker: "BAD" }] }),
    ),
  );
  await page.goto("/");
  await expect(page.getByText("Saved data could not be read.")).toBeVisible();
  await page.getByRole("button", { name: "Reset local account" }).click();
  await page
    .getByRole("button", { name: "Start Learning", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Let’s find your starting point." }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("synchronizes trades and resets between open tabs", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore Demo" }).click();
  const other = await context.newPage();
  await other.goto("/");
  await expect(
    other.getByRole("heading", { name: /A little wiser/ }),
  ).toBeVisible();
  await page.goto("/market/AAPL");
  await page.getByRole("button", { name: "Review buy AAPL" }).click();
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(
    other.locator(".stat").filter({ hasText: "Available cash" }),
  ).toContainText("$9,786.93");
  await page.getByRole("button", { name: "Got it · keep exploring" }).click();
  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset simulator" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  await expect(
    other.locator(".stat").filter({ hasText: "Available cash" }),
  ).toContainText("$10,000.00");
  await other.close();
});
