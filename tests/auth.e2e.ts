import { test, expect } from "./fixtures";
test("sign-up is visible on welcome and explains email confirmation", async ({
  page,
}) => {
  await page.route("**/auth/v1/signup**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-4000-8000-000000000001",
        email: "learner@example.com",
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      }),
    }),
  );
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Account sign-in" });
  await expect(
    panel.getByRole("heading", { name: "Save your progress" }),
  ).toBeVisible();
  await panel.getByLabel("First name", { exact: true }).fill("Taylor");
  await panel.getByLabel("Email", { exact: true }).fill("learner@example.com");
  await panel.getByLabel("Password", { exact: true }).fill("test-password-123");
  const signupRequest = page.waitForRequest("**/auth/v1/signup**");
  await panel
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  expect((await signupRequest).postDataJSON().data.first_name).toBe("Taylor");
  await expect(panel.getByRole("status")).toContainText("Check your email");
  await page.getByRole("button", { name: "Try the Simulator" }).click();
  await expect(
    panel.getByRole("button", { name: "Create account", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
});
test("failed sign-in reports the error and keeps guest mode", async ({
  page,
}) => {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error_code: "invalid_credentials",
        msg: "Invalid login credentials",
      }),
    }),
  );
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Account sign-in" });
  await panel.getByLabel("First name", { exact: true }).fill("Taylor");
  await panel.getByLabel("Email", { exact: true }).fill("learner@example.com");
  await panel.getByLabel("Password", { exact: true }).fill("test-password-123");
  await panel.getByLabel("Signup referral code").fill("?");
  await panel.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(panel.getByRole("status")).toContainText(
    "Invalid login credentials",
  );
  await expect(
    panel.getByRole("button", { name: "Create account", exact: true }),
  ).toBeVisible();
});
test("signed-in state survives reload and sign-out restores separate guest state", async ({
  page,
}) => {
  const id = "00000000-0000-4000-8000-000000000001";
  const user = {
    id,
    email: "learner@example.com",
    aud: "authenticated",
    role: "authenticated",
    created_at: new Date().toISOString(),
  };
  const token =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(
      JSON.stringify({
        sub: id,
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: "authenticated",
      }),
    ).toString("base64url") +
    ".test";
  const state = {
    profile: {
      id,
      name: "Taylor",
      experience: "new",
      beginner: true,
      onboarded: true,
    },
    cash: 8765,
    holdings: [],
    trades: [],
    orders: [],
    watchlist: ["AAPL"],
    tick: 0,
    snapshots: [{ date: "Start", value: 10000 }],
    learning: { completed: [], attempts: [], xp: 0, streak: 0, lastDay: "" },
  };
  await page.route("**/auth/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      status: path.endsWith("logout") ? 204 : 200,
      contentType: "application/json",
      body: path.endsWith("logout")
        ? undefined
        : JSON.stringify(
            path.endsWith("user")
              ? user
              : {
                  access_token: token,
                  refresh_token: "test-refresh",
                  token_type: "bearer",
                  expires_in: 3600,
                  user,
                },
          ),
    });
  });
  await page.route("**/rest/v1/paper_accounts**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { account: state, updated_at: "2026-01-01T00:00:00Z" },
      ]),
    }),
  );
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Account sign-in" });
  await panel.getByLabel("First name", { exact: true }).fill("Taylor");
  await panel.getByLabel("Email", { exact: true }).fill(user.email);
  await panel.getByLabel("Password", { exact: true }).fill("test-password-123");
  await panel.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Cloud account", { exact: true })).toBeVisible();
  await page.goto("/dashboard");
  await expect(
    page.getByText("Welcome back, Taylor. Your next small step starts here."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Cloud account", { exact: true })).toBeVisible();
  await expect(panel).toHaveCount(0);
  for(const path of ["/learn","/market","/tools","/profile"]){await page.goto(path);await expect(page.getByRole("heading").first()).toBeVisible();await expect(panel).toHaveCount(0);}
  await page.getByLabel("Current password", {exact:true}).fill("test-password-123");
  await page.getByLabel("New password (optional)", {exact:true}).fill("a-new-password-123");
  const changed=page.waitForRequest(r=>r.url().includes("/auth/v1/user")&&r.method()==="PUT");
  await page.getByRole("button",{name:"Update account"}).click();
  expect((await changed).postDataJSON().password).toBe("a-new-password-123");
  await expect(page.getByText("Your password was updated.")).toBeVisible();
  await page.goto("/learn");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(
    panel.getByRole("button", { name: "Create account", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Try the simulator" }),
  ).toBeVisible();
});

test('email confirmation rate limits give actionable help without reporting signup success',async({page})=>{await page.route('**/auth/v1/signup**',r=>r.fulfill({status:429,contentType:'application/json',body:JSON.stringify({code:'over_email_send_rate_limit',msg:'email rate limit exceeded'})}));await page.goto('/');const panel=page.getByRole('region',{name:'Account sign-in'});await panel.getByLabel('First name',{exact:true}).fill('Taylor');await panel.getByLabel('Email',{exact:true}).fill('learner@example.com');await panel.getByLabel('Password',{exact:true}).fill('test-password-123');await panel.getByRole('button',{name:'Create account',exact:true}).click();await expect(panel.getByRole('status')).toContainText('confirmation-email service is temporarily limited');await expect(panel.getByRole('status')).toContainText('sprouttradinghelp@gmail.com');await expect(panel.getByRole('button',{name:'Create account',exact:true})).toBeEnabled();});
