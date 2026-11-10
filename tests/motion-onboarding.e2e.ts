import { test, expect } from "./fixtures";
import guides from "../lib/education/onboarding-tutorials.json";
import curriculumVideos from "../lib/education/tutorials.json";
test("all recorded walkthroughs play narration with captions", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto("/learn?view=Tutorials");
  await expect(page.locator(".onboarding-video-card")).toHaveCount(6);
  for (const guide of guides) {
    await page.getByLabel("Walkthrough section").selectOption(guide.category);
    await page
      .getByRole("button", {
        name: new RegExp(guide.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .click();
    const dialog = page.getByRole("dialog", { name: guide.title, exact: true }),
      video = dialog.locator("video");
    expect(await video.evaluate((v) => (v as HTMLVideoElement).autoplay)).toBe(
      false,
    );
    await video.evaluate(async (v: HTMLVideoElement) => {
      v.muted = true;
      await v.play();
    });
    await expect
      .poll(() =>
        video.evaluate(
          (v) =>
            (v as HTMLVideoElement & { webkitAudioDecodedByteCount: number })
              .webkitAudioDecodedByteCount,
        ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        video.evaluate(
          (v) => (v as HTMLVideoElement).textTracks[0]?.cues?.length ?? 0,
        ),
      )
      .toBeGreaterThan(3);
    await expect
      .poll(() =>
        video.evaluate((v) => (v as HTMLVideoElement).textTracks[0]?.mode),
      )
      .toBe("showing");
    expect(
      Math.abs(
        (await video.evaluate((v) => (v as HTMLVideoElement).duration)) -
          guide.duration,
      ),
    ).toBeLessThan(1);
    await dialog.getByText("Read transcript", { exact: true }).click();
    await expect(
      dialog.getByText(guide.scenes[0].caption, { exact: false }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Close dialog" }).click();
  }
});
test("lesson entrance and contextual video work with reduced-motion support", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Quick access" })
    .getByRole("link", { name: "Lessons", exact: true })
    .click();
  const lesson = page.getByRole("dialog", {
    name: "What is a stock?",
    exact: true,
  });
  await expect(lesson).toBeVisible();
  await expect(lesson).toHaveCSS("animation-name", "sprout-dialog");
  await expect(lesson.getByRole("region",{name:"Lesson opening"})).toBeVisible();
  await lesson.getByRole("button",{name:"Begin learning"}).click();
  await lesson.getByRole("button", { name: "How to use this lesson" }).click();
  const video = page.getByRole("dialog", {
    name: "Complete a lesson and quiz",
    exact: true,
  });
  await expect(video.locator("video")).toBeVisible();
  await video.getByRole("button", { name: "Close dialog" }).click();
  await expect(lesson).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(lesson).toHaveCSS("animation-name", "none");
  await lesson.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/learn?view=Modules");
  await expect(page.locator("main > .motion-surface")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.locator(".compact-module summary").first().click();
  await page.getByRole("button",{name:"Start module quiz",exact:true}).first().click();
  const moduleDialog=page.getByRole("dialog",{name:"Market Basics",exact:true});
  await expect(moduleDialog.getByRole("region",{name:"Lesson opening"})).toBeVisible();
  await moduleDialog.getByRole("button",{name:"Begin learning"}).click();
  await expect(moduleDialog.getByRole("heading",{name:"Key concepts",exact:true})).toBeVisible();
  await moduleDialog.getByRole("button",{name:"Close dialog",exact:true}).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/market");
  await page.getByRole("button", { name: "Watch the simulator guide" }).click();
  await expect(
    page
      .getByRole("dialog", {
        name: "Buy and sell in the simulator",
        exact: true,
      })
      .locator("video"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("all trading concept recordings have playable audio and captions", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/learn");
  for (const guide of curriculumVideos) {
    await page.evaluate(
      ({ slug, version }) => {
        document.querySelector("#media-check")?.remove();
        const video = document.createElement("video");
        video.id = "media-check";
        video.controls = true;
        video.muted = true;
        video.src = `/tutorials/${slug}.mp4?v=${version}`;
        const track = document.createElement("track");
        track.kind = "captions";
        track.srclang = "en";
        track.default = true;
        track.src = `/tutorials/${slug}.vtt?v=${version}`;
        video.append(track);
        document.body.append(video);
      },
      { slug: guide.slug, version: guide.narrationVersion },
    );
    const video = page.locator("#media-check");
    await video.evaluate(async (v: HTMLVideoElement) => {
      await v.play();
    });
    await expect
      .poll(() =>
        video.evaluate(
          (v) =>
            (v as HTMLVideoElement & { webkitAudioDecodedByteCount: number })
              .webkitAudioDecodedByteCount,
        ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        video.evaluate(
          (v) => (v as HTMLVideoElement).textTracks[0]?.cues?.length ?? 0,
        ),
      )
      .toBeGreaterThan(3);
    expect(
      Math.abs(
        (await video.evaluate((v) => (v as HTMLVideoElement).duration)) -
          guide.duration,
      ),
    ).toBeLessThan(1);
  }
});
