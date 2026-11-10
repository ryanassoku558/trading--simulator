import { test, expect } from "./fixtures";
test("compact home and learning keep core actions in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Learn Trading the Simple Way." }),
  ).toBeVisible();
  expect(
    await page
      .locator(".home-path")
      .evaluate((e) => e.getBoundingClientRect().bottom),
  ).toBeLessThan(900);
  await page.goto("/learn");
  expect(
    await page
      .locator(".compact-module-grid")
      .evaluate((e) => e.getBoundingClientRect().bottom),
  ).toBeLessThan(900);
  await page.getByRole("button", { name: "Start first lesson" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Modules", exact: true }).click();
  await expect(page.locator(".compact-module-grid > details")).toHaveCount(6);
  await expect(
    page.locator(".compact-module-grid > details[open]"),
  ).toHaveCount(0);
  await page.locator(".compact-module-grid summary").first().click();
  await expect(
    page.locator(".compact-module-lessons").first().getByRole("button"),
  ).toHaveCount(4);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 7")).toBeVisible();
  await page.locator(".compact-module-grid summary").first().click();
  await page
    .getByRole("button", { name: "Unlock with Pro", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Lessons", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(page.locator(".compact-lesson-grid > button")).toHaveCount(8);
  await page.getByLabel("Search lessons").fill("zzzzzzzz");
  await expect(
    page.getByText("No matches. Try another search or topic."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Glossary", exact: true }).click();
  await expect(page.locator(".glossary-grid > details")).toHaveCount(8);
  await page.getByRole("button", { name: "Study games", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Glossary practice" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tutorials", exact: true }).click();
  await expect(page.locator(".onboarding-video-grid > button")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Trading & investing", exact: true })
    .click();
  await expect(page.locator(".tutorial-grid > button")).toHaveCount(4);
  await page.goto("/achievements");
  await expect(
    page.getByRole("heading", { name: "Your progress", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Achievements", exact: true }).click();
  await expect(page.locator(".achievement-grid > section")).toHaveCount(6);
});
test("mobile and dark mode retain accessible persistent navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  const nav = page.locator("#workspace-navigation");
  await expect(
    nav.getByRole("link", { name: "Glossary", exact: true }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "Glossary", exact: true }).click();
  await expect(page.locator(".glossary-grid")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await expect(page.getByLabel("Search trading glossary")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(
    await page
      .locator(".topbar")
      .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
  ).toBe(0);
});
