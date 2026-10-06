import bundled from "@sparticuz/chromium";
import { createRequire } from "node:module";
import {
  mkdirSync,
  readFileSync,
  existsSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const media = resolve("docs/previews");
const temporary = join(tmpdir(), "sprout-preview-recordings");
mkdirSync(media, { recursive: true });
mkdirSync(temporary, { recursive: true });
if (process.platform === "linux") {
  const binary = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
  if (!existsSync(binary))
    throw new Error("Install FFmpeg to record and convert preview videos.");
  process.env.PLAYWRIGHT_BROWSERS_PATH = join(temporary, "browser-tools");
  const revision = JSON.parse(
    readFileSync(
      join(
        dirname(require.resolve("playwright-core/package.json")),
        "browsers.json",
      ),
      "utf8",
    ),
  ).browsers.find((b) => b.name === "ffmpeg").revision;
  const folder = join(
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    `ffmpeg-${revision}`,
  );
  mkdirSync(folder, { recursive: true });
  if (!existsSync(join(folder, "ffmpeg-linux")))
    symlinkSync(binary, join(folder, "ffmpeg-linux"));
}
const { chromium, expect } = await import("@playwright/test");
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.platform === "linux" ? await bundled.executablePath() : undefined,
  args:
    process.platform === "linux"
      ? bundled.args.filter((a) => a !== "--single-process")
      : [],
});
const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
const shots = [],
  videos = [],
  errors = [];
let carriedState;
const pause = (page) => page.waitForTimeout(900);
async function shot(page, name, title, fullPage = true) {
  await pause(page);
  await page.screenshot({ path: join(media, name + ".png"), fullPage });
  shots.push({ name, title });
  console.log(`Screenshot: ${title}`);
}
async function go(page, route) {
  await page.goto(baseURL + route);
  await expect(page.locator("h1")).toBeVisible();
  await pause(page);
}
async function buy(page, ticker, shares) {
  await go(page, "/market/" + ticker);
  await page.getByLabel("Number of shares").fill(String(shares));
  await page.getByRole("button", { name: `Review buy ${ticker}` }).click();
  await pause(page);
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(
    page.getByRole("heading", { name: "Explain My Trade" }),
  ).toBeVisible();
  await pause(page);
  await page.getByRole("button", { name: "Got it · keep exploring" }).click();
}
async function clip(name, title, viewport, run) {
  const context = await browser.newContext({
    viewport,
    storageState: carriedState,
    recordVideo: { dir: temporary, size: viewport },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await run(page);
    await pause(page);
    carriedState = await context.storageState();
  } finally {
    await context.close();
  }
  const source = await page.video().path();
  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  const mp4 = join(media, name + ".mp4");
  const encoded = spawnSync(
    ffmpeg,
    [
      "-y",
      "-i",
      source,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "26",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      mp4,
    ],
    { encoding: "utf8" },
  );
  if (encoded.status !== 0) throw new Error(encoded.stderr);
  const gif = join(media, name + ".gif");
  const gifResult = spawnSync(
    ffmpeg,
    [
      "-y",
      "-i",
      mp4,
      "-filter_complex",
      "fps=5,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
      "-loop",
      "0",
      gif,
    ],
    { encoding: "utf8" },
  );
  if (gifResult.status !== 0) throw new Error(gifResult.stderr);
  videos.push({ name, title });
  console.log(`Video and animated preview: ${title}`);
}
try {
  await clip(
    "01-first-steps",
    "From welcome to your first lesson and trade",
    { width: 1280, height: 900 },
    async (page) => {
      await go(page, "/");
      await shot(page, "01-landing", "Welcome page");
      await page
        .getByRole("button", { name: "Start Learning", exact: true })
        .click();
      await shot(page, "02-onboarding", "Choose your experience level", false);
      await page
        .getByRole("button", { name: "Create my practice space" })
        .click();
      await shot(
        page,
        "03-welcome",
        "Beginner welcome and virtual balance",
        false,
      );
      await page.getByRole("button", { name: "Start with a lesson" }).click();
      await shot(page, "04-learning", "Five-level learning journey");
      await page.getByRole("button", { name: "What is a stock?" }).click();
      await shot(page, "05-lesson", "What is a stock? lesson", false);
      await page
        .getByRole("button", { name: "B A small piece of a company" })
        .click();
      await page.getByRole("button", { name: "Check answer" }).click();
      await shot(
        page,
        "06-quiz-success",
        "Instant quiz feedback and XP",
        false,
      );
      await page
        .getByRole("button", { name: "Make your first practice trade" })
        .click();
      await expect(page.getByText("Let’s buy your first share.")).toBeVisible();
      await shot(page, "07-guided-trade", "Guided first Apple trade");
      await page.getByRole("button", { name: "Review buy AAPL" }).click();
      await shot(page, "08-confirmation", "Review a virtual trade", false);
      await page.getByRole("button", { name: "Confirm buy" }).click();
      await expect(
        page.getByRole("heading", { name: "Explain My Trade" }),
      ).toBeVisible();
      await shot(
        page,
        "09-explain-trade",
        "Understand price moves and position size",
        false,
      );
      await page
        .getByRole("button", { name: "Got it · keep exploring" })
        .click();
      await go(page, "/");
      await shot(page, "10-dashboard", "Dashboard after a first trade");
    },
  );
  await clip(
    "02-portfolio-trading",
    "Buying, tracking a portfolio, and selling",
    { width: 1280, height: 900 },
    async (page) => {
      await buy(page, "NVDA", 2);
      await buy(page, "MSFT", 1);
      await go(page, "/portfolio");
      await shot(
        page,
        "11-portfolio",
        "Three-stock portfolio, returns, and allocation",
      );
      await go(page, "/achievements");
      await shot(
        page,
        "12-achievements",
        "First Lesson, First Trade, and Portfolio Builder",
      );
      await go(page, "/market/AAPL");
      await page.getByRole("button", { name: "Advance market" }).click();
      await pause(page);
      await page.getByRole("button", { name: "Sell", exact: true }).click();
      await page.getByRole("button", { name: "Review sell AAPL" }).click();
      await pause(page);
      await page.getByRole("button", { name: "Confirm sell" }).click();
      await expect(
        page.getByRole("heading", { name: "Explain My Trade" }),
      ).toBeVisible();
      await shot(
        page,
        "13-sell-explanation",
        "Sell explanation and realized profit",
        false,
      );
      await page
        .getByRole("button", { name: "Got it · keep exploring" })
        .click();
      await go(page, "/history");
      await shot(
        page,
        "14-trade-history",
        "Transaction history with reopened explanations",
      );
      await page
        .getByRole("button", { name: "Explain My Trade" })
        .first()
        .click();
      await pause(page);
      await page.getByRole("button", { name: "Close dialog" }).click();
    },
  );
  await clip(
    "03-market-limit-orders",
    "Explore stocks, charts, watchlists, and limit orders",
    { width: 1280, height: 900 },
    async (page) => {
      await go(page, "/market");
      await shot(page, "15-market", "Ten simulated stocks and funds");
      await page.getByRole("textbox", { name: "Search stocks" }).fill("nvidia");
      await shot(page, "16-market-search", "Search by company or ticker");
      await go(page, "/market/NVDA");
      await page.getByRole("button", { name: "1Y", exact: true }).click();
      await shot(
        page,
        "17-stock-detail",
        "Stock details and interactive timeframes",
      );
      await page.getByRole("button", { name: "1W", exact: true }).click();
      await pause(page);
      await go(page, "/market/TSLA");
      await page.getByRole("button", { name: "Add to watchlist" }).click();
      await pause(page);
      await page.getByLabel("Order type").selectOption("limit");
      await page.getByLabel("Limit price").fill("300");
      await shot(page, "18-limit-order", "Create a pending limit order");
      await page
        .getByRole("button", { name: "Place limit order TSLA" })
        .click();
      await pause(page);
      await page.getByRole("button", { name: "Confirm limit order" }).click();
      await go(page, "/history");
      await shot(
        page,
        "19-pending-order",
        "Pending limit and cancellation controls",
      );
      await page.getByRole("button", { name: "Advance market" }).click();
      await expect(
        page.getByRole("heading", { name: "Explain My Trade" }),
      ).toBeVisible();
      await pause(page);
      await page
        .getByRole("button", { name: "Got it · keep exploring" })
        .click();
      await shot(
        page,
        "20-filled-order",
        "Limit order filled by simulated market movement",
      );
    },
  );
  await clip(
    "04-mobile-tour",
    "A complete tour on a phone-sized screen",
    { width: 390, height: 844 },
    async (page) => {
      await go(page, "/");
      await shot(page, "21-mobile-dashboard", "Mobile dashboard");
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await shot(
        page,
        "22-mobile-navigation",
        "Mobile navigation drawer",
        false,
      );
      await page.getByRole("link", { name: "Learn", exact: true }).click();
      await expect(page.locator("h1")).toBeVisible();
      await shot(page, "23-mobile-learning", "Mobile learning journey");
      await go(page, "/market");
      await shot(page, "24-mobile-market", "Responsive market cards");
      await go(page, "/market/AAPL");
      await shot(
        page,
        "25-mobile-stock",
        "Mobile stock details and trade panel",
      );
      await go(page, "/portfolio");
      await shot(page, "26-mobile-portfolio", "Mobile portfolio and holdings");
      await go(page, "/settings");
      await shot(
        page,
        "27-mobile-settings",
        "Beginner Mode and account settings",
      );
      await page.getByRole("button", { name: "Reset simulator" }).click();
      await shot(page, "28-mobile-reset", "Reset requires confirmation", false);
      await page.getByRole("button", { name: "Close dialog" }).click();
    },
  );
  if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
  writeFileSync(
    join(media, "manifest.json"),
    JSON.stringify({ screenshots: shots, videos }, null, 2) + "\n",
  );
  console.log(
    `Recorded ${shots.length} screenshots and ${videos.length} videos with no page errors.`,
  );
} finally {
  await browser.close();
}
