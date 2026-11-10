import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const folder = "docs/previews";
const { screenshots, videos } = JSON.parse(
  readFileSync(join(folder, "manifest.json"), "utf8"),
);
for (const shot of screenshots)
  if (!existsSync(join(folder, shot.name + ".png")))
    throw new Error("Missing screenshot: " + shot.name);
for (const video of videos)
  for (const extension of ["mp4", "gif"])
    if (!existsSync(join(folder, video.name + "." + extension)))
      throw new Error("Missing recording: " + video.name);
const lines = [
  "# Sprout preview gallery",
  "",
  `${screenshots.length} screenshots and ${videos.length} silent walkthrough videos, recorded from the working app. All account balances and trades are simulated.`,
  "",
  "## Moving previews",
  "",
  "The animations below play directly on this page. Each recording also has a full MP4 version.",
  "",
];
for (const video of videos)
  lines.push(
    `### ${video.title}`,
    "",
    `![Animated walkthrough: ${video.title}](${video.name}.gif)`,
    "",
    `[Full video (MP4)](${video.name}.mp4)`,
    "",
  );
lines.push("## Desktop screenshots", "");
for (const shot of screenshots.filter((s) => !s.name.includes("mobile")))
  lines.push(`### ${shot.title}`, "", `![${shot.title}](${shot.name}.png)`, "");
lines.push(
  "## Mobile screenshots",
  "",
  "Expand a screen below to see the full phone layout.",
  "",
);
for (const shot of screenshots.filter((s) => s.name.includes("mobile")))
  lines.push(
    "<details>",
    `<summary>${shot.title}</summary>`,
    "",
    `![${shot.title}](${shot.name}.png)`,
    "",
    "</details>",
    "",
  );
lines.push(
  "## Recreate the previews",
  "",
  "These are real browser recordings, not mockups. No application source is changed by the capture script.",
  "",
  "Run the app, install FFmpeg for video conversion, then run:",
  "",
  "```bash",
  "npm run preview:media",
  "node scripts/build-preview-gallery.mjs",
  "```",
  "",
  "The recorder uses a separate demo browser account. It captures actual onboarding, quizzes, order confirmations, filled market and limit orders, holdings, and responsive navigation. The default target is the running app on port 3001; set TEST_BASE_URL for another port. Linux capture uses the installed system FFmpeg binary. On other operating systems, install Playwright Chromium and FFmpeg first.",
);
writeFileSync(join(folder, "README.md"), lines.join("\n") + "\n");
const root = readFileSync("README.md", "utf8");
const preview = [
  "## App preview",
  "",
  `**[Open the full gallery: ${screenshots.length} pictures and ${videos.length} videos](docs/previews/README.md)**`,
  "",
  "You can view the screenshots and moving previews on GitHub without downloading the app.",
  "",
  "### Dashboard",
  "",
  "![Sprout dashboard with a $10,000 virtual practice account](docs/preview.png)",
  "",
  "### Video previews",
  "",
];
for (const video of videos)
  preview.push(
    `#### ${video.title}`,
    "",
    `[![Moving preview: ${video.title}](docs/previews/${video.name}.gif)](docs/previews/${video.name}.mp4)`,
    "",
  );
preview.push("### More screens", "");
for (const name of [
  "01-landing",
  "09-explain-trade",
  "11-portfolio",
  "15-market",
  "12-achievements",
]) {
  const shot = screenshots.find((s) => s.name === name);
  preview.push(
    `#### ${shot.title}`,
    "",
    `![${shot.title}](docs/previews/${shot.name}.png)`,
    "",
  );
}
preview.push(
  "[View all desktop and mobile screenshots](docs/previews/README.md)",
  "",
);
writeFileSync(
  "README.md",
  root.replace(/## App preview\n[\s\S]*?(?=\n## Features)/, preview.join("\n")),
);
console.log(
  "Created the full preview gallery and updated the repository homepage.",
);
