#!/usr/bin/env node
/**
 * Mint preview assets for the Templates-page browse cards (founder-run; not CI).
 *
 * For every manifest entry without a preview image (or with --force), renders
 *   assets/templates/<templateKey with "/" -> "__">/preview.png
 * via the m0saic CLI at 1280x720. Ids listed in ANIMATED_PREVIEW_IDS also get
 * preview.mp4 (640x360, 2s) + poster.png.
 *
 * Budgets (hard): preview.png <= 150 KB, preview.mp4 <= 1 MB — the whole
 * corpus stays clonable. Oversized outputs are deleted and reported.
 *
 * CLI resolution and Windows quoting: same rules as tools/smoke-render.mjs
 * (M0SAIC_CLI env override, shell spawn on win32).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = process.platform === "win32";
const FORCE = process.argv.includes("--force");

const PNG_BUDGET = 150 * 1024;
const MP4_BUDGET = 1024 * 1024;

/** Ids whose motion is the point — these also get preview.mp4 + poster.png. */
const ANIMATED_PREVIEW_IDS = new Set([]);

/** Per-id overrides when the default flags don't fit (e.g. multi-output pipelines). */
const PREVIEW_OVERRIDES = new Map([]);

function resolveCli() {
  const env = process.env.M0SAIC_CLI;
  if (env && env.trim().length > 0) {
    if (env.endsWith(".js")) return { cmd: process.execPath, prefix: [env] };
    return { cmd: env, prefix: [] };
  }
  return { cmd: "m0saic", prefix: [] };
}

function quoteArg(arg) {
  if (!IS_WIN) return arg;
  return /[\s"@()^&|<>]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;
}

function runCli(args, label) {
  const { cmd, prefix } = resolveCli();
  const full = [...prefix, ...args];
  const result = IS_WIN
    ? spawnSync([cmd, ...full.map(quoteArg)].join(" "), { shell: true, stdio: "pipe", encoding: "utf8" })
    : spawnSync(cmd, full, { stdio: "pipe", encoding: "utf8" });
  if (result.error && result.error.code === "ENOENT") {
    console.error(`gen-previews: cannot find the m0saic CLI. Set M0SAIC_CLI or install it.`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`x ${label}`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
    return false;
  }
  return true;
}

function enforceBudget(file, budget, label) {
  if (!fs.existsSync(file)) return true;
  const size = fs.statSync(file).size;
  if (size <= budget) return true;
  fs.rmSync(file);
  console.error(
    `x ${label}: ${(size / 1024).toFixed(0)} KB exceeds the ${(budget / 1024).toFixed(0)} KB budget — deleted. ` +
      "Simplify the default props or add a PREVIEW_OVERRIDES entry.",
  );
  return false;
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "template-manifest.json"), "utf8"),
);

let minted = 0;
let skipped = 0;
let failures = 0;

for (const entry of manifest.templates ?? []) {
  const key = String(entry.templateKey);
  const encoded = key.replace(/\//g, "__");
  const dir = path.join(ROOT, "assets", "templates", encoded);
  const png = path.join(dir, "preview.png");

  if (fs.existsSync(png) && !FORCE) {
    skipped += 1;
  } else {
    fs.mkdirSync(dir, { recursive: true });
    const extra = PREVIEW_OVERRIDES.get(key) ?? [];
    const ok = runCli(
      ["make", key, "--template-repo", ROOT, "-w", "1280", "-h", "720", "--format", "image", "-o", png, "--quiet", ...extra],
      `preview ${key}`,
    );
    if (ok && enforceBudget(png, PNG_BUDGET, `preview.png for ${key}`)) {
      minted += 1;
      console.log(`  ok preview ${key}`);
    } else {
      failures += 1;
    }
  }

  if (ANIMATED_PREVIEW_IDS.has(key)) {
    const mp4 = path.join(dir, "preview.mp4");
    const poster = path.join(dir, "poster.png");
    if (!fs.existsSync(mp4) || FORCE) {
      const okMp4 = runCli(
        ["make", key, "--template-repo", ROOT, "-w", "640", "-h", "360", "--durationMs", "2000", "-o", mp4, "--quiet"],
        `preview.mp4 ${key}`,
      );
      if (!okMp4 || !enforceBudget(mp4, MP4_BUDGET, `preview.mp4 for ${key}`)) failures += 1;
    }
    if (!fs.existsSync(poster) || FORCE) {
      const okPoster = runCli(
        ["make", key, "--template-repo", ROOT, "-w", "640", "-h", "360", "--format", "image", "-o", poster, "--quiet"],
        `poster.png ${key}`,
      );
      if (!okPoster || !enforceBudget(poster, PNG_BUDGET, `poster.png for ${key}`)) failures += 1;
    }
  }
}

console.log(`\ngen-previews: minted ${minted}, skipped ${skipped} existing, ${failures} failure(s)`);
console.log("gen-previews: re-run `npm run build` so the manifest picks up new preview paths.");
if (failures > 0) process.exit(1);
