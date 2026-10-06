import { test, expect } from "./fixtures";
test("beginner path starts with day trading and continues to ownership without a premature trade prompt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the Simulator" }).click();
  await page.goto("/learn");
  await page.getByRole("button", { name: "Start beginner path" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "What is day trading?" }),
  ).toBeVisible();
  await dialog
    .getByRole("button", {
      name: "B No, it spans different trading days",
      exact: true,
    })
    .click();
  await dialog.getByRole("button", { name: "Check answer" }).click();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "What is a stock?" }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "B A small piece of a company", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Check answer" }).click();
  await expect(
    dialog.getByRole("button", { name: "Make your first practice trade" }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "What does buying a stock mean?" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("2 / 151 lessons")).toBeVisible();
});
test("all five beginner labs work and account-rule references are visible on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Try the Simulator" }).click();
  const exercise = page.getByRole("region", {
    name: "Interactive practice exercise",
  });
  await page.goto("/learn?lesson=50");
  await exercise
    .getByRole("button", { name: "Show spread calculation" })
    .click();
  await expect(exercise.getByRole("status")).toContainText("$0.20 spread");
  await page.goto("/learn?lesson=51");
  await exercise.getByLabel("Practice share count").fill("20");
  await expect(exercise.getByRole("status")).toContainText("$100.00 loss");
  await exercise.getByLabel("Practice share count").fill("0");
  await expect(exercise.getByRole("status")).toContainText(
    "Enter a whole number",
  );
  await page.goto("/learn?lesson=52");
  await exercise
    .getByRole("button", { name: "Compare $100 buy limit", exact: true })
    .click();
  await expect(exercise.getByRole("status")).toContainText("may not fill");
  await page.goto("/learn?lesson=53");
  await exercise
    .getByRole("button", { name: "Review my practice plan" })
    .click();
  await expect(
    exercise.getByText(/Complete your entry condition/),
  ).toBeVisible();
  await exercise
    .getByLabel("Observation and entry condition")
    .fill("Observe the example before entering.");
  await exercise
    .getByLabel("What would invalidate the idea?")
    .fill("The observation no longer holds.");
  await exercise
    .getByLabel("Intended exit conditions")
    .fill("Reassess if the idea fails.");
  await exercise
    .getByRole("button", { name: "Review my practice plan" })
    .click();
  await expect(exercise.getByText(/You have described an entry/)).toBeVisible();
  await page.goto("/learn?lesson=54");
  await exercise
    .getByRole("button", { name: "Review the decision process" })
    .click();
  await expect(exercise.getByRole("status")).toContainText(
    "one trade is not proof",
  );
  await page.goto("/learn?lesson=39");
  await expect(page.getByText("Scope and current requirements")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /FINRA investor guidance/ }),
  ).toHaveAttribute("href", "https://www.finra.org/investors");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
