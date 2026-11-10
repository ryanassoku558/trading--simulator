import chromium from "@sparticuz/chromium";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const browserCache = join(tmpdir(), "sprout-browser-cache");
mkdirSync(browserCache, { recursive: true });
const path =
  process.platform === "linux" ? await chromium.executablePath() : undefined;
const result = spawnSync(
  process.execPath,
  ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      XDG_CACHE_HOME: browserCache,
      TEST_CHROMIUM_PATH: path,
      TEST_CHROMIUM_ARGS: JSON.stringify(
        process.platform === "linux"
          ? chromium.args.filter(arg => arg !== "--single-process")
          : [],
      ),
    },
  },
);
process.exit(result.status ?? 1);
