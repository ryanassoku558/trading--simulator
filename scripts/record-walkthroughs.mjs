// Actual browser recordings in an isolated, intercepted demonstration account.
// Requires a local production server, ffmpeg, and generated narration. Never targets live services.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
  mkdtempSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import bundled from "@sparticuz/chromium";
const require = createRequire(import.meta.url),
  base = process.env.WALKTHROUGH_BASE_URL || "http://127.0.0.1:3095";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw Error("Recordings must use a local preview.");
const root = mkdtempSync(join(tmpdir(), "sprout-ui-recordings-")),
  cache = join(root, "browsers");
process.env.PLAYWRIGHT_BROWSERS_PATH = cache;
const revision = JSON.parse(
  readFileSync(
    join(
      dirname(require.resolve("playwright-core/package.json")),
      "browsers.json",
    ),
  ),
).browsers.find((b) => b.name === "ffmpeg").revision;
mkdirSync(join(cache, "ffmpeg-" + revision), { recursive: true });
symlinkSync(
  "/usr/bin/ffmpeg",
  join(cache, "ffmpeg-" + revision, "ffmpeg-linux"),
);
const { chromium, expect } = await import("@playwright/test");
const browser = await chromium.launch({
  executablePath: await bundled.executablePath(),
  args: bundled.args.filter((a) => a !== "--single-process"),
  headless: true,
});
const paths = [
    "lib/education/onboarding-tutorials.json",
    "lib/education/tutorials.json",
  ],
  catalogues = paths.map((p) => JSON.parse(readFileSync(p))),
  requested = process.argv.slice(2),
  videos = catalogues
    .flat()
    .filter((t) => !requested.length || requested.includes(t.slug)),
  lessonData = JSON.parse(readFileSync("/tmp/sprout-lesson-data.json"));
const audio = process.env.TUTORIAL_NARRATION_DIR || "/tmp/sprout-ui-audio";
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      ...args,
    ]);
    let error = "";
    child.stderr.on("data", (d) => (error += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => (code ? reject(Error(error)) : resolve()));
  });
}
function duration(path) {
  return Number(
    spawnSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=nw=1:nk=1",
        path,
      ],
      { encoding: "utf8" },
    ).stdout,
  );
}
const stamp = (n) => {
  const ms = Math.max(0, Math.round(n * 1000));
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
};
async function record(video) {
  const id = "00000000-0000-4000-8000-000000000001",
    user = {
      id,
      email: "demo@example.com",
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
    },
    token =
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url",
      ) +
      "." +
      Buffer.from(
        JSON.stringify({
          sub: id,
          exp: Math.floor(Date.now() / 1000) + 36000,
          aud: "authenticated",
        }),
      ).toString("base64url") +
      ".demo";
  let state = {
      profile: {
        id,
        name: "Demo Learner",
        experience: "new",
        beginner: true,
        onboarded: true,
      },
      cash: 10000,
      holdings: [],
      trades: [],
      orders: [],
      watchlist: ["AAPL", "SPY"],
      tick: 0,
      snapshots: [{ date: "Start", value: 10000 }],
      learning: { completed: [], attempts: [], xp: 0, streak: 0, lastDay: "" },
    },
    version = new Date().toISOString();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    timezoneId: "America/New_York",
    recordVideo: { dir: root, size: { width: 1440, height: 900 } },
  });
  await context.addInitScript(
    ({ session }) => {
      localStorage.setItem(
        "sb-kbphftwnggadpfbyctve-auth-token",
        JSON.stringify(session),
      );
      localStorage.setItem("sprout-theme", "light");
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent =
          "#walk-cursor{position:fixed;width:18px;height:18px;border:3px solid white;border-radius:50%;background:#13794d;box-shadow:0 0 0 4px #13794d55;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%)}#walk-cursor.pressed{box-shadow:0 0 0 14px #13794d66}#walk-label{position:fixed;top:7px;left:246px;background:#113c2b;color:white;border-radius:6px;padding:6px 10px;z-index:2147483646;font:11px Arial;pointer-events:none}.sprouty-help{display:none!important}dialog::backdrop{backdrop-filter:none!important}dialog{animation:none!important;transition:none!important}";
        document.head.append(style);
        const label = document.createElement("div");
        label.id = "walk-label";
        label.textContent = "GUIDED DEMO · Pro features shown where applicable";
        document.body.append(label);
        const cursor = document.createElement("div");
        cursor.id = "walk-cursor";
        cursor.style.left = "500px";
        cursor.style.top = "80px";
        document.body.append(cursor);
        document.addEventListener("pointermove", (e) => {
          const dialogs = [...document.querySelectorAll("dialog[open]")],
            parent = dialogs.at(-1) || document.body;
          if (cursor.parentNode !== parent) parent.append(cursor);
          const bounds = parent.getBoundingClientRect();
          cursor.style.position =
            parent === document.body ? "fixed" : "absolute";
          cursor.style.left =
            e.clientX - (parent === document.body ? 0 : bounds.left) + "px";
          cursor.style.top =
            e.clientY -
            (parent === document.body ? 0 : bounds.top) +
            parent.scrollTop +
            "px";
        });
        document.addEventListener("pointerdown", () => {
          cursor.classList.add("pressed");
          setTimeout(() => cursor.classList.remove("pressed"), 500);
        });
      });
    },
    {
      session: {
        access_token: token,
        refresh_token: "demo",
        expires_at: Math.floor(Date.now() / 1000) + 36000,
        expires_in: 36000,
        token_type: "bearer",
        user,
      },
    },
  );
  await context.route("**/*", async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.origin === new URL(base).origin) {
      if (url.pathname === "/api/billing/status")
        return route.fulfill({ json: { pro: true, ready: false } });
      if (url.pathname === "/api/community/status")
        return route.fulfill({ json: { community: true, reviews: true } });
      return route.continue();
    }
    if (url.pathname.includes("/auth/v1/"))
      return route.fulfill({
        json: url.pathname.endsWith("/user")
          ? user
          : {
              user,
              access_token: token,
              refresh_token: "demo",
              expires_in: 36000,
            },
      });
    if (url.pathname.includes("/rest/v1/paper_accounts")) {
      if (req.method() === "PATCH") {
        const body = req.postDataJSON();
        state = body.account;
        version = body.updated_at;
        return route.fulfill({ json: [{ updated_at: version }] });
      }
      return route.fulfill({ json: [{ account: state, updated_at: version }] });
    }
    if (url.pathname.includes("/rest/v1/rpc/"))
      return route.fulfill({ json: {} });
    if (url.pathname.includes("/rest/v1/")) return route.fulfill({ json: [] });
    return route.abort();
  });
  const started = Date.now(),
    page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  async function pause(ms = 500) {
    await page.waitForTimeout(ms);
  }
  async function click(locator) {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (box)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 12,
      });
    await pause(220);
    await locator.click({ force: true });
    await pause(550);
  }
  const button = (name) => page.getByRole("button", { name, exact: true });
  async function go(path) {
    if (new URL(page.url()).pathname === path && !path.includes("?")) return;
    const link = page.locator(`aside a[href="${path}"]`).first();
    if (await link.count()) {
      if (!(await link.isVisible())) {
        const menu =
          path === "/profile" || path === "/settings"
            ? page.locator(".sidebar-account-menu")
            : page.locator(".sidebar-more");
        if (!(await menu.getAttribute("open")))
          await click(menu.locator("summary"));
      }
      await click(link);
    } else await page.goto(base + path);
    await pause(350);
  }
  async function field(name, value) {
    const input = page.getByLabel(name, { exact: true });
    await input.scrollIntoViewIfNeeded();
    await click(input);
    await input.fill(String(value));
    await pause(400);
  }
  async function close() {
    await click(
      page
        .getByRole("dialog")
        .last()
        .getByRole("button", { name: "Close dialog", exact: true }),
    );
  }
  async function lesson(id) {
    await go("/learn");
    await click(button("Lessons"));
    await page
      .getByRole("heading", { name: "Key concepts", exact: true })
      .waitFor();
    if (id !== 1) {
      await close();
      await field("Search lessons", lessonData.find((l) => l.id === id).title);
      await click(page.locator(".compact-lesson-grid button").first());
      await page
        .getByRole("heading", { name: "Key concepts", exact: true })
        .waitFor();
    }
  }
  async function trade(side) {
    if (!page.url().includes("/market")) await go("/market");
    await click(
      page.locator(".trade-panel").getByRole("button", {
        name: side === "buy" ? "Buy" : "Sell",
        exact: true,
      }),
    );
    await field("Number of shares", 1);
    await click(button(`Review ${side} AAPL`));
    await click(button(`Confirm ${side}`));
    await page
      .getByRole("heading", { name: "Explain My Trade", exact: true })
      .waitFor();
    await click(button("Got it · keep exploring"));
  }
  async function seedTrade() {
    if (!state.trades.length) {
      await go("/market");
      await trade("buy");
    }
  }
  async function tool(name) {
    await go("/tools");
    await click(
      page
        .getByRole("group", { name: "Trading tools" })
        .getByRole("button", { name, exact: true }),
    );
  }
  async function action(key) {
    switch (key) {
      case "home-nav":
        await go("/learn");
        await go("/dashboard");
        break;
      case "home-path":
        await go("/learn?view=Modules");
        await go("/dashboard");
        break;
      case "home-tools":
        await go("/tools");
        break;
      case "lesson-open":
        await lesson(1);
        break;
      case "lesson-study":
        await click(button("Next slide"));
        await click(button("Next slide"));
        break;
      case "lesson-quiz":
        await click(button("Start quiz"));
        for (let i = 0; i < 5; i++) {
          await click(
            page.locator(".quiz-options button").nth(i === 0 ? 0 : 1),
          );
          await click(button("Check answer"));
          await click(button(i === 4 ? "Finish quiz" : "Next question"));
        }
        await expect(
          page.getByText("PROGRESS SAVED", { exact: true }),
        ).toBeVisible();
        break;
      case "module-open":
        await go("/learn?view=Modules");
        await click(page.locator(".compact-module summary").first());
        await click(button("Start module quiz").first());
        await page
          .getByRole("heading", { name: "Key concepts", exact: true })
          .waitFor();
        break;
      case "module-study":
        await click(button("Examples"));
        await click(button("Practice & summary"));
        await click(button("Next slide"));
        break;
      case "module-quiz":
        for (let i = 0; i < 2; i++) await click(button("Next slide"));
        await click(button("Start quiz"));
        await click(button("Review presentation"));
        break;
      case "sim-open":
        await go("/market");
        await expect(page.locator("canvas").first()).toBeVisible();
        await click(button("Start hands-on buy & sell tutorial"));
        await page.getByLabel("Candle interval").selectOption("5m");
        {
          await expect(page.locator(".hands-on-coach")).toContainText(
            "Inspect the chart",
          );
          const box = await page
            .locator(".trading-chart-workspace canvas")
            .first()
            .boundingBox();
          await page.mouse.move(box.x + 100, box.y + 100, { steps: 12 });
          await page.mouse.click(box.x + 100, box.y + 100);
          await pause();
        }
        await click(button("No, future movement is uncertain"));
        break;
      case "sim-review":
        await click(
          page
            .locator(".trade-panel")
            .getByRole("button", { name: "Buy", exact: true }),
        );
        await field("Number of shares", 1);
        await click(button("Review buy AAPL"));
        break;
      case "sim-buy":
        await click(button("Confirm buy"));
        await page
          .getByRole("heading", { name: "Explain My Trade", exact: true })
          .waitFor();
        await click(button("Got it · keep exploring"));
        await expect(page.locator(".trade-panel")).toContainText(
          "Shares owned",
        );
        break;
      case "sim-sell":
        await trade("sell");
        if (state.trades.length !== 2 || state.holdings.length)
          throw Error("Buy/sell walkthrough did not complete both fills.");
        break;
      case "progress-open":
        await go("/achievements");
        break;
      case "progress-badges":
        await click(button("Achievements"));
        await click(
          page
            .getByRole("navigation", { name: "Achievement pages" })
            .getByRole("button", { name: "Next", exact: true }),
        );
        break;
      case "progress-habits":
        await click(button("Habits & goals"));
        await field("Daily reminder time", "09:30");
        await click(button("Add daily calendar reminder"));
        break;
      case "glossary-search":
        await go("/learn?view=Glossary");
        await field("Search trading glossary", "VWAP");
        await click(page.locator(".glossary-grid summary").first());
        break;
      case "glossary-cards":
        await click(button("Study games"));
        await click(button("Show definition"));
        await click(button("I know this"));
        break;
      case "glossary-match":
        await click(button("Matching"));
        await click(
          page
            .locator(".glossary-match > div")
            .first()
            .locator("button")
            .first(),
        );
        for (const definition of await page
          .locator(".glossary-match > div")
          .last()
          .locator("button")
          .all()) {
          if (await definition.isEnabled()) await click(definition);
          if (
            await page
              .locator(".glossary-match > div")
              .first()
              .locator("button")
              .first()
              .isDisabled()
          )
            break;
        }
        break;
      case "tool-position":
        await tool("Position size");
        break;
      case "tool-position-input":
        await field("Calculator practice budget", 1000);
        await field("Position sizing risk percentage", 1);
        await field("Calculator entry price", 100);
        await field("Calculator stop price", 98);
        break;
      case "tool-position-guide":
        await click(
          page
            .locator(".visual-tool:visible")
            .getByText("How to use it", { exact: true }),
        );
        break;
      case "tool-risk":
        await tool("Risk");
        break;
      case "tool-risk-input":
        await page.locator(".visual-tool:visible input[type=range]").fill("2");
        await pause();
        break;
      case "tool-risk-result":
        await tool("Position size");
        await expect(
          page.getByLabel("Position sizing risk percentage"),
        ).toHaveValue("2");
        break;
      case "tool-profit":
        await tool("Profit / loss");
        break;
      case "tool-profit-input":
        await page.getByLabel("Hypothetical exit price").fill("112");
        await pause();
        break;
      case "tool-profit-loss":
        await page.getByLabel("Hypothetical exit price").fill("94");
        await pause();
        break;
      case "tool-volatility":
        await tool("Volatility");
        break;
      case "tool-volatility-guide":
        await click(
          page
            .locator(".visual-tool:visible")
            .getByText("How to use it", { exact: true }),
        );
        break;
      case "tool-volatility-result":
        await tool("Position size");
        break;
      case "practice-open":
        await go("/practice");
        await click(button("Chart lab"));
        break;
      case "practice-choice":
        await click(page.locator(".lab-choices button").first());
        break;
      case "practice-challenge":
        await click(button("Challenges"));
        await click(button("Start three-trade challenge"));
        break;
      case "portfolio-open":
        await go("/portfolio");
        break;
      case "portfolio-holding":
        await seedTrade();
        await go("/portfolio");
        await page.locator(".table-scroll").first().scrollIntoViewIfNeeded();
        break;
      case "portfolio-chart":
        await click(page.locator('main a[href="/market/AAPL"]').first());
        break;
      case "history-open":
        await seedTrade();
        await go("/market");
        await trade("sell");
        await go("/history");
        break;
      case "history-review":
        await click(page.locator("table button").first());
        await page
          .getByRole("heading", { name: "Explain My Trade", exact: true })
          .waitFor();
        await click(button("Got it · keep exploring"));
        break;
      case "history-journal":
        await click(
          page.getByRole("link", { name: /Open trade journal & analytics/ }),
        );
        break;
      case "journal-open":
        await seedTrade();
        await go("/practice#journal");
        await click(button("Journal"));
        break;
      case "journal-write":
        await field(
          "Trade journal note",
          "I planned a small position, checked the possible loss, and reviewed the trade before confirming. Next time I will compare the broader trend.",
        );
        await page.getByLabel("Trading emotion").selectOption("Calm");
        break;
      case "journal-save":
        await click(button("Save journal entry"));
        await expect(button("Journal saved")).toBeVisible();
        break;
      case "community-open":
        await go("/community");
        await click(button("Strategy sharing"));
        await click(button("Discussions"));
        break;
      case "community-draft":
        await field(
          "Community post title",
          "How do you review a trading plan?",
        );
        await field(
          "Community post body",
          "I compare the entry, possible loss, and reason for the trade before I practice. What evidence would change your plan?",
        );
        break;
      case "community-board":
        await click(button("Leaderboards"));
        break;
      case "profile-open":
        await go("/profile");
        break;
      case "profile-edit":
        await field("Display name", "Demo Trader");
        await click(button("Save profile"));
        break;
      case "profile-progress":
        await page.locator(".profile-learning").scrollIntoViewIfNeeded();
        await pause();
        break;
      case "settings-open":
        await go("/settings");
        break;
      case "settings-beginner":
        await click(
          page.getByRole("switch", { name: "Beginner Mode", exact: true }),
        );
        await click(
          page.getByRole("switch", { name: "Beginner Mode", exact: true }),
        );
        break;
      case "settings-theme":
        await click(page.locator(".theme-toggle"));
        await pause();
        break;
      case "plans-open":
        await go("/pricing");
        break;
      case "plans-compare":
        await page.locator(".subscription-comparison").scrollIntoViewIfNeeded();
        await pause();
        break;
      case "plans-cancel":
        await page.locator(".pricing-faq").scrollIntoViewIfNeeded();
        await pause();
        break;
      case "tutorials-open":
        await go("/learn");
        await click(button("Tutorials"));
        break;
      case "tutorials-filter":
        await page.getByLabel("Walkthrough section").selectOption("Tools");
        await pause();
        break;
      case "tutorials-transcript":
        await click(page.locator(".onboarding-video-card").first());
        await click(
          page
            .getByRole("dialog")
            .getByText("Read transcript", { exact: true }),
        );
        break;
      case "chart-open":
        await go("/market");
        await page.getByLabel("Candle interval").selectOption("5m");
        await click(button("Zoom in"));
        break;
      case "chart-indicator":
        await click(button("Indicators"));
        await click(page.getByLabel("SMA", { exact: true }));
        break;
      case "chart-tour":
        await click(button("Sprouty chart tour"));
        await click(button("Next step"));
        break;
      case "curriculum-open":
        await lesson(video.lessonIds[0]);
        break;
      case "curriculum-example":
        await click(button("Next slide"));
        break;
      case "curriculum-practice":
        await click(button("Next slide"));
        await click(page.getByText("Show the reasoning", { exact: true }));
        break;
      default:
        throw Error("Unknown action " + key);
    }
  }
  try {
    await page.goto(base + "/");
    await expect(page.locator(".home-path")).toBeVisible();
    await expect(
      page.getByText("Cloud account", { exact: true }),
    ).toBeVisible();
    const segments = [];
    for (let i = 0; i < video.scenes.length; i++) {
      console.log(`RECORDING ${video.slug}: ${i + 1}/${video.scenes.length}`);
      const scene = video.scenes[i],
        narration = JSON.parse(
          readFileSync(join(audio, `${video.slug}-${i}.json`)),
        ),
        start = (Date.now() - started) / 1000;
      await action(scene.action);
      await page.screenshot({
        path: join(root, `${video.slug}-${i}-checkpoint.png`),
        animations: "disabled",
      });
      await pause(800);
      const actionSeconds = (Date.now() - started) / 1000 - start,
        remaining = process.env.WALKTHROUGH_VALIDATE_ONLY
          ? 0.1
          : Math.max(0.6, narration.duration + 0.5 - actionSeconds);
      await pause(remaining * 1000);
      segments.push({
        start,
        length: (Date.now() - started) / 1000 - start,
        narration,
        index: i,
      });
    }
    const end = (Date.now() - started) / 1000;
    await context.close();
    if (process.env.WALKTHROUGH_VALIDATE_ONLY) {
      console.log("VALIDATED " + video.slug);
      return;
    }
    const raw = await page.video().path(),
      rawDuration = duration(raw),
      adjustment = Math.max(0, end - rawDuration),
      clips = [];
    let vtt = "WEBVTT\n\n",
      offset = 0,
      cue = 1;
    for (const seg of segments) {
      const out = join(root, `${video.slug}-${seg.index}.mp4`),
        start = Math.max(0, seg.start - adjustment),
        length = seg.length;
      await run([
        "-ss",
        String(start),
        "-i",
        raw,
        "-i",
        join(audio, `${video.slug}-${seg.index}.wav`),
        "-t",
        String(length),
        "-vf",
        "fps=24,scale=1280:800",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "25",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-af",
        "apad",
        out,
      ]);
      clips.push(out);
      for (const c of seg.narration.cues)
        vtt += `${cue++}\n${stamp(offset + c.start)} --> ${stamp(offset + c.end)}\n${c.text}\n\n`;
      offset += duration(out);
    }
    const list = join(root, video.slug + ".txt");
    writeFileSync(list, clips.map((c) => `file '${c}'`).join("\n"));
    await run([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      list,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      `public/tutorials/${video.slug}.mp4`,
    ]);
    await run([
      "-ss",
      "0.4",
      "-i",
      clips[0],
      "-frames:v",
      "1",
      "-c:v",
      "libwebp",
      `public/tutorials/${video.slug}.webp`,
    ]);
    writeFileSync(`public/tutorials/${video.slug}.vtt`, vtt);
    video.duration = Math.round(offset);
    video.narrationVersion = "actual-ui-v3";
    video.recordingType = "actual-interface";
    writeFileSync(
      join(root, video.slug + "-proof.json"),
      JSON.stringify({
        slug: video.slug,
        actions: video.scenes.map((s) => s.action),
        completedTrades: state.trades.length,
        holdings: state.holdings.length,
        completedLessons: state.learning.completed.length,
        errors,
      }),
    );
    console.log(
      `RECORDED ${video.slug}: ${video.duration}s, ${video.scenes.length} actual interface sequences`,
    );
  } catch (error) {
    await page
      .screenshot({
        path: join(root, video.slug + "-FAILED.png"),
        timeout: 10000,
        animations: "disabled",
      })
      .catch(() => {});
    await context.close().catch(() => {});
    throw Error(
      video.slug + ": " + error.message + " (evidence: " + root + ")",
    );
  }
}
const failures = [];
let next = 0;
async function worker() {
  while (next < videos.length) {
    const video = videos[next++];
    try {
      await record(video);
    } catch (e) {
      console.error(e.message);
      failures.push(e.message);
    }
  }
}
await Promise.all(
  Array.from({ length: Number(process.env.WALKTHROUGH_WORKERS || 1) }, () =>
    worker(),
  ),
);
await browser.close();
for (let i = 0; i < paths.length; i++)
  writeFileSync(paths[i], JSON.stringify(catalogues[i], null, 2) + "\n");
console.log("Recording evidence: " + root);
if (failures.length) throw Error(failures.length + " walkthroughs failed.");
