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
const ANIMATED_PREVIEW_IDS = new Set([
  // The drawtext column's % counter is the lesson's beat; a still freezes it.
  "@m0saic-starter/text/text-three-ways/v1",
  // The ramp IS the template. A still shows the counter at t=0.
  "@m0saic-starter/text/count-up/v1",
  // A camera walk is motion by definition; a still is one arbitrary settle.
  "@m0saic-starter/compose/camera-follow/v1",
  // The crossfade IS the lesson — a still lands on one side of it.
  "@m0saic-starter/pipelines/two-scenes/v1",
  // The back-edge only reads as one when you see step 1 inherit step 0.
  "@m0saic-starter/pipelines/ref-across-steps/v1",
  // A pipeline inside a tile: the inner scenes have to change to make the point.
  "@m0saic-starter/pipelines/nested-pipeline/v1",
]);

/** Ids whose still must be CUT from the mp4 rather than rendered directly.
 *  Two different reasons, both landing here:
 *
 *   1. An emit:"single" pipeline cannot produce an image AT ALL — the engine
 *      rejects it ("Image outputs are not supported for mosaic_pipeline
 *      renderables under emit:single").
 *   2. The template renders fine as an image, but the FIRST FRAME is not
 *      representative — a timed sequence has barely started at t=0, and any
 *      reveal that begins from nothing is outright blank there.
 *
 *  Needs an ffmpeg on PATH (or M0SAIC_FFMPEG), same as
 *  tools/regen-fixtures.mjs. */
const STILL_FROM_VIDEO = new Set([
  // (1) emit:single pipelines.
  "@m0saic-starter/pipelines/two-scenes/v1",
  "@m0saic-starter/pipelines/ref-across-steps/v1",
  "@m0saic-starter/pipelines/nested-pipeline/v1",
]);
const FFMPEG = process.env.M0SAIC_FFMPEG || "ffmpeg";

/** Cut one frame out of `video` into `still`, `atSec` in. */
function frameFromVideo(video, still, atSec, label) {
  const result = spawnSync(
    FFMPEG,
    ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(atSec), "-i", video, "-frames:v", "1", still],
    { stdio: "pipe", encoding: "utf8" },
  );
  if (result.error && result.error.code === "ENOENT") {
    console.error(`x ${label}: ffmpeg not found ("${FFMPEG}"). Set M0SAIC_FFMPEG.`);
    return false;
  }
  if (result.status !== 0) {
    console.error(`x ${label}`);
    if (result.stderr) console.error(result.stderr.trim());
    return false;
  }
  return true;
}

/** emit:"multi" templates write `{base}-{step}.{ext}`, never `{base}.{ext}` —
 *  so a preview has to name the step it wants and move it into place. */
const MULTI_OUTPUT_STEP = new Map([
  ["@m0saic-starter/pipelines/fan-out/v1", "landscape"],
  ["@m0saic-starter/pipelines/png-sequence/v1", "frame-1"],
  ["@m0saic-starter/pipelines/ref-reframe/v1", "reframed"],
]);

/** Per-id preview canvas when 1280x720 misrepresents the template — or
 *  (media units showing real video frames) busts the PNG budget. */
const PREVIEW_DIMS = new Map([
  ["@m0saic-starter/basics/hot-reload-canary/v1", ["720", "720"]],
  ["@m0saic-starter/media/probe-card/v1", ["640", "360"]],
  ["@m0saic-starter/media/luma-badge/v1", ["384", "216"]],
  ["@m0saic-starter/media/time-range-clip/v1", ["426", "240"]],
  ["@m0saic-starter/media/time-ranges-medley/v1", ["426", "160"]],
  ["@m0saic-starter/media/play-speed/v1", ["426", "240"]],
  // Full-bleed video frame: photographic, so it busts the PNG budget at 720p
  // and still does at 426x240 (176 KB). This is the largest 16:9 that fits.
  ["@m0saic-starter/surfaces/render-cover/v1", ["384", "216"]],
]);

/** Per-id overrides when the default flags don't fit (e.g. multi-output
 *  pipelines, or media units whose default props render the pick-a-file
 *  prompt — previews use the repo's committed fixtures instead, absolutized
 *  against the repo root so ffmpeg's workspace cwd can't lose them).
 *  url-asset stays on defaults on purpose (its explainer is offline-safe). */
const FX = (rel) => path.join(ROOT, rel).split(path.sep).join("/");
const PROPS = (obj) => JSON.stringify(obj);
const PREVIEW_OVERRIDES = new Map([
  ["@m0saic-starter/media/image-card/v1", ["--props", PROPS({ image: FX("assets/media/epoch-m-1024x1024.png") })]],
  ["@m0saic-starter/media/folder-contact-strip/v1", ["--props", PROPS({ images: ["tile-red", "tile-gold", "tile-green", "tile-blue"].map((t) => FX(`assets/media/${t}.png`)) })]],
  ["@m0saic-starter/media/probe-card/v1", ["--props", PROPS({ media: FX("assets/media/bbb-2s.mp4") })]],
  ["@m0saic-starter/media/time-range-clip/v1", ["--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), clipStartMs: 500, clipEndMs: 1500 })]],
  ["@m0saic-starter/media/time-ranges-medley/v1", ["--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), ranges: [{ startMs: 0, endMs: 700 }, { startMs: 700, endMs: 1400 }, { startMs: 1400, endMs: 2000 }] })]],
  ["@m0saic-starter/media/luma-badge/v1", ["--props", PROPS({ image: FX("assets/media/bbb-frame-960x540.jpg") })]],
  ["@m0saic-starter/media/play-speed/v1", ["--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), sampleMs: 1000, speed: 1, loopMode: "loop" })]],
  ["@m0saic-starter/media/audio-mix/v1", ["--props", PROPS({ narration: FX("assets/media/tone-440-320x240-2s.mp4"), narrationVolume: 1 })]],
  // Carved type with no file falls back to a flat colour — true, but it hides
  // the whole point (a picture playing through the letters).
  // With variants on, `encodes` renames the master and no preview.png lands.
  ["@m0saic-starter/pipelines/encode-matrix/v1", ["--props", PROPS({ web: false, mobile: false })]],
  ["@m0saic-starter/text/carved-type/v1", ["--props", PROPS({ word: "MOSAIC", media: FX("assets/media/bbb-frame-960x540.jpg") })]],
  // Its render is STRICT by design, so default props render the "needs a
  // clip" report card — a rough browse tile for the one template whose
  // subject is not having a broken first impression. (The friendly page is
  // its renderCover, which is editor-only and unreachable from `make`.)
  ["@m0saic-starter/surfaces/render-cover/v1", ["--props", PROPS({ clip: FX("assets/media/bbb-2s.mp4") })]],
]);

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
  if (!fs.existsSync(file)) {
    // Not a no-op: a CLI that "succeeded" while writing its output somewhere
    // else (encodes renaming the master, emit:"multi" step suffixes) used to
    // slip through here and report a preview that does not exist.
    console.error(`x ${label}: the CLI exited 0 but ${path.basename(file)} was never written.`);
    return false;
  }
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
  const fromVideo = STILL_FROM_VIDEO.has(key);

  // Order matters for `fromVideo` ids: the mp4 is the SOURCE of their still,
  // so it has to be on disk before the still branch runs.
  if (ANIMATED_PREVIEW_IDS.has(key)) {
    const mp4 = path.join(dir, "preview.mp4");
    if (!fs.existsSync(mp4) || FORCE) {
      fs.mkdirSync(dir, { recursive: true });
      // PREVIEW_OVERRIDES apply here too. For a `fromVideo` id this mp4 IS
      // the source of the still, so omitting them meant an override was
      // silently ignored for exactly the templates that most need one.
      const mp4Extra = PREVIEW_OVERRIDES.get(key) ?? [];
      // No duration flag — the CLI's 2s default is exactly the preview length.
      const okMp4 = runCli(
        ["make", key, "--template-repo", ROOT, "-w", "640", "-h", "360", "-o", mp4, "--quiet", ...mp4Extra],
        `preview.mp4 ${key}`,
      );
      if (!okMp4 || !enforceBudget(mp4, MP4_BUDGET, `preview.mp4 for ${key}`)) failures += 1;
    }
  }

  if (fs.existsSync(png) && !FORCE) {
    skipped += 1;
  } else if (fromVideo) {
    // 40% in: past a leading transition, before a trailing one.
    fs.mkdirSync(dir, { recursive: true });
    const mp4 = path.join(dir, "preview.mp4");
    const ok =
      fs.existsSync(mp4) && frameFromVideo(mp4, png, 0.8, `preview.png for ${key} (from preview.mp4)`);
    if (ok && enforceBudget(png, PNG_BUDGET, `preview.png for ${key}`)) {
      minted += 1;
      console.log(`  ok preview ${key} (cut from preview.mp4)`);
    } else {
      failures += 1;
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
    const extra = PREVIEW_OVERRIDES.get(key) ?? [];
    const [w, h] = PREVIEW_DIMS.get(key) ?? ["1280", "720"];
    const step = MULTI_OUTPUT_STEP.get(key);
    let ok = runCli(
      ["make", key, "--template-repo", ROOT, "-w", w, "-h", h, "--format", "image", "-o", png, "--quiet", ...extra],
      `preview ${key}`,
    );
    if (ok && step !== undefined) {
      // The run wrote preview-<step>.png (and its siblings). Keep the named
      // one as the preview, drop the rest.
      const wanted = png.replace(/\.png$/, `-${step}.png`);
      if (!fs.existsSync(wanted)) {
        console.error(`x preview ${key}: expected step output ${path.basename(wanted)} — check MULTI_OUTPUT_STEP.`);
        ok = false;
      } else {
        fs.renameSync(wanted, png);
        for (const sibling of fs.readdirSync(dir)) {
          if (/^preview-.+\.png$/.test(sibling)) fs.rmSync(path.join(dir, sibling));
        }
      }
    }
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
    if (fromVideo) {
      if (!fs.existsSync(poster) || FORCE) {
        const okPoster =
          fs.existsSync(mp4) && frameFromVideo(mp4, poster, 0.8, `poster.png for ${key}`);
        if (!okPoster || !enforceBudget(poster, PNG_BUDGET, `poster.png for ${key}`)) failures += 1;
      }
    } else if (!fs.existsSync(poster) || FORCE) {
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
