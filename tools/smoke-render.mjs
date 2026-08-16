#!/usr/bin/env node
/**
 * Render smoke for humans — requires the `m0saic` CLI (not run in CI).
 *
 * Pass 1: every template in template-manifest.json goes through
 *         `m0saic make <id> --template-repo <root> --validate-only`.
 *         (`list-templates` cannot see external repos; validate-only is the
 *         correct existence/props check for a repo like this one.)
 * Pass 2: the curated SMOKE_RENDERS list below renders tiny real outputs
 *         into test-output/ for eyeballing.
 *
 * CLI resolution: the M0SAIC_CLI env var (a command or a path to the CLI's
 * dist/index.js) wins; otherwise `m0saic` from PATH.
 *
 * Cross-platform: spawns through a shell on Windows (global npm bins are
 * .cmd shims there) and quotes every argument itself.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "test-output");
const IS_WIN = process.platform === "win32";
// Fixture paths absolutized against the repo root — relative paths probe
// fine but break at ffmpeg's workspace cwd.
const FX = (rel) => path.join(ROOT, rel).split(path.sep).join("/");
const PROPS = (obj) => JSON.stringify(obj);

/** Tiny real renders for pass 2 — grow this list with the corpus. */
const SMOKE_RENDERS = [
  {
    id: "@m0saic-starter/basics/hello-world/v1",
    out: "hello-world.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/basics/hot-reload-canary/v1",
    out: "hot-reload-canary.png",
    args: ["-w", "360", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/basics/color-tiles/v1",
    out: "color-tiles.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/basics/aspect-adaptive-card/v1",
    out: "aspect-adaptive-card-landscape.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/basics/aspect-adaptive-card/v1",
    out: "aspect-adaptive-card-portrait.png",
    args: ["-w", "360", "-h", "640", "--format", "image"],
  },
  {
    // Two states on purpose: the disease (wobbling ratio gutters), then
    // the inset cure — the pair IS the lesson.
    id: "@m0saic-starter/geometry/quantization-cures/v1",
    out: "quantization-cures-naive.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/quantization-cures/v1",
    out: "quantization-cures-inset.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", '{"method":"inset"}'],
  },
  {
    id: "@m0saic-starter/geometry/inset-recovery/v1",
    out: "inset-recovery.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/gcd-collapse/v1",
    out: "gcd-collapse.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    // 1280 wide on purpose: the 240px rails read as PINNED next to the
    // ratio band's 320px sides (640 wide would clamp the rail).
    id: "@m0saic-starter/geometry/ratio-vs-absolute/v1",
    out: "ratio-vs-absolute.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/overlay-stack/v1",
    out: "overlay-stack.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/lattice-gutters/v1",
    out: "lattice-gutters.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/place-rect-dock/v1",
    out: "place-rect-dock.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/geometry/mask-in-a-cell/v1",
    out: "mask-in-a-cell.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    id: "@m0saic-starter/props/typed-props-tour/v1",
    out: "typed-props-tour.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/props/seeded-shuffle/v1",
    out: "seeded-shuffle.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/props/color-props/v1",
    out: "color-props.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/props/json-data-prop/v1",
    out: "json-data-prop.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    id: "@m0saic-starter/props/control-gallery/v1",
    out: "control-gallery.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    // Broken on purpose: the smoke artifact for this unit IS the report card.
    id: "@m0saic-starter/props/error-mosaic/v1",
    out: "error-mosaic-report-card.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", '{"ratio":5,"accent":"orange"}'],
  },
  {
    // Media units render against the repo's own committed fixtures,
    // absolutized via FX so any invocation cwd works.
    id: "@m0saic-starter/media/image-card/v1",
    out: "image-card.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ image: FX("assets/media/epoch-m-1024x1024.png") })],
  },
  {
    id: "@m0saic-starter/media/folder-contact-strip/v1",
    out: "folder-contact-strip.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ images: ["tile-red", "tile-gold", "tile-green", "tile-blue"].map((t) => FX(`assets/media/${t}.png`)) })],
  },
  {
    id: "@m0saic-starter/media/probe-card/v1",
    out: "probe-card.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ media: FX("assets/media/bbb-2s.mp4") })],
  },
  {
    // mp4: the windowed clip is temporal.
    id: "@m0saic-starter/media/time-range-clip/v1",
    out: "time-range-clip.mp4",
    args: ["-w", "1280", "-h", "720", "--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), clipStartMs: 500, clipEndMs: 1500 })],
  },
  {
    // mp4: three windows of the same source, side by side.
    id: "@m0saic-starter/media/time-ranges-medley/v1",
    out: "time-ranges-medley.mp4",
    args: ["-w", "1280", "-h", "720", "--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), ranges: [{ startMs: 0, endMs: 700, label: "open" }, { startMs: 700, endMs: 1400 }, { startMs: 1400, endMs: 2000, label: "close" }] })],
  },
  {
    // A 16:9 PHOTO, not the square brand mark: cover-fit crops a square to
    // nonsense, and the badge needs real luminance variety to have
    // anything to adapt to.
    id: "@m0saic-starter/media/luma-badge/v1",
    out: "luma-badge.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ image: FX("assets/media/bbb-frame-960x540.jpg") })],
  },
  {
    // mp4 at 4s: a 1s sample at 1x loops FOUR times, so the seam (and
    // therefore loopMode) is visible in the artifact.
    id: "@m0saic-starter/media/play-speed/v1",
    out: "play-speed-loop.mp4",
    args: ["-w", "1280", "-h", "720", "--durationMs", "4000", "--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), sampleMs: 1000, speed: 1, loopMode: "loop" })],
  },
  {
    // Same window, opposite tail: one play then a frozen last frame.
    id: "@m0saic-starter/media/play-speed/v1",
    out: "play-speed-freeze.mp4",
    args: ["-w", "1280", "-h", "720", "--durationMs", "4000", "--props", PROPS({ video: FX("assets/media/bbb-2s.mp4"), sampleMs: 1000, speed: 1, loopMode: "freeze" })],
  },
  {
    id: "@m0saic-starter/media/audio-mix/v1",
    out: "audio-mix.mp4",
    args: ["-w", "1280", "-h", "720", "--props", PROPS({ narration: FX("assets/media/tone-440-320x240-2s.mp4"), narrationVolume: 1 })],
  },
  {
    // url-asset smoke stays OFFLINE-SAFE: the empty-prop explainer card.
    id: "@m0saic-starter/media/url-asset/v1",
    out: "url-asset-explainer.png",
    args: ["-w", "1280", "-h", "720", "--format", "image"],
  },
  {
    // mp4 on purpose: the drawtext column's % counter is the lesson's beat,
    // and a still would freeze it at frame 0.
    id: "@m0saic-starter/text/text-three-ways/v1",
    out: "text-three-ways.mp4",
    args: ["-w", "1280", "-h", "720"],
  },
  {
    // The pair IS the lesson: a fitted block, then the same copy unfitted.
    id: "@m0saic-starter/text/fit-text/v1",
    out: "fit-text-fitted.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ mode: "fit-block", boxWidthPct: 60 })],
  },
  {
    id: "@m0saic-starter/text/fit-text/v1",
    out: "fit-text-clipped.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ mode: "unfitted", boxWidthPct: 60 })],
  },
  {
    // mp4: a still freezes the counter at frame 0 — the trap the template's
    // own toggle demonstrates.
    id: "@m0saic-starter/text/count-up/v1",
    out: "count-up.mp4",
    args: ["-w", "1280", "-h", "720", "--durationMs", "3000"],
  },
  {
    id: "@m0saic-starter/text/carved-type/v1",
    out: "carved-type.png",
    args: [
      "-w", "1280", "-h", "720", "--format", "image",
      "--props", PROPS({ word: "MOSAIC", media: FX("assets/media/bbb-frame-960x540.jpg") }),
    ],
  },
  {
    id: "@m0saic-starter/masks/shape-masks/v1",
    out: "shape-masks-pill.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ shape: "pill" })],
  },
  {
    id: "@m0saic-starter/masks/shape-masks/v1",
    out: "shape-masks-circle.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ shape: "circle" })],
  },
  {
    // Ring vs disc: the same two subpaths, one sweep flag apart.
    id: "@m0saic-starter/masks/path-mask/v1",
    out: "path-mask-ring.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ innerWinding: "opposite" })],
  },
  {
    id: "@m0saic-starter/masks/path-mask/v1",
    out: "path-mask-filled.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ innerWinding: "same" })],
  },
  {
    // The matte wash is an mp4 on purpose: a still composites onto a
    // transparent base and drops alpha at encode time, so a partial matte
    // shows at full strength there. Video blends it correctly.
    id: "@m0saic-starter/masks/path-mask/v1",
    out: "path-mask-matte.mp4",
    args: ["-w", "1280", "-h", "720", "--props", PROPS({ innerWinding: "opposite", matte: 0.35 })],
  },
  {
    id: "@m0saic-starter/compose/child-mosaic/v1",
    out: "child-mosaic.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ childGrid: 4 })],
  },
  {
    // The A/B this template exists for: same card, one has room to turn.
    id: "@m0saic-starter/compose/rotate-headroom/v1",
    out: "rotate-in-place.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ angle: 30, mode: "in-place" })],
  },
  {
    id: "@m0saic-starter/compose/rotate-headroom/v1",
    out: "rotate-headroom.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ angle: 30, mode: "headroom" })],
  },
  {
    id: "@m0saic-starter/compose/nested-template/v1",
    out: "nested-template.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ slotPct: 30 })],
  },
  {
    // The child on its own — internal is about intent, not capability.
    id: "@m0saic-starter/compose/nested-badge/v1",
    out: "nested-badge.png",
    args: ["-w", "384", "-h", "720", "--format", "image"],
  },
  {
    // mp4: the walk and the pull-back are the whole point.
    id: "@m0saic-starter/compose/camera-follow/v1",
    out: "camera-follow.mp4",
    args: ["-w", "1280", "-h", "720", "--durationMs", "6000"],
  },
  {
    // The producer half: swatches plus the token block it publishes.
    id: "@m0saic-starter/compose/theme-provider/v1",
    out: "theme-provider-light.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ mode: "light" })],
  },
  {
    // The consumer, re-skinned by calling that producer by id — the trio is
    // the lesson: same template, three palettes, nothing imported.
    id: "@m0saic-starter/compose/theme-tokens/v1",
    out: "theme-tokens-dark.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ source: "provider", mode: "dark" })],
  },
  {
    id: "@m0saic-starter/compose/theme-tokens/v1",
    out: "theme-tokens-light.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ source: "provider", mode: "light" })],
  },
  {
    id: "@m0saic-starter/compose/theme-tokens/v1",
    out: "theme-tokens-hc.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ source: "provider", mode: "high-contrast" })],
  },
  {
    // And the path you actually ship: no producer, local constants.
    id: "@m0saic-starter/compose/theme-tokens/v1",
    out: "theme-tokens-local.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ source: "local" })],
  },
  {
    // These two should look IDENTICAL — that is the claim being smoked.
    id: "@m0saic-starter/compose/reduce-to-one/v1",
    out: "reduce-to-one-flat.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ mode: "flat", density: 8 })],
  },
  {
    id: "@m0saic-starter/compose/reduce-to-one/v1",
    out: "reduce-to-one-reduced.png",
    args: ["-w", "1280", "-h", "720", "--format", "image", "--props", PROPS({ mode: "reduced", density: 8 })],
  },
  // ── pipelines ────────────────────────────────────────────────
  {
    // Two documents, one file: the output is A + B - d, and the crossfade
    // only exists at the seam.
    id: "@m0saic-starter/pipelines/two-scenes/v1",
    out: "two-scenes.mp4",
    args: ["-w", "640", "-h", "360", "--durationMs", "1200", "--props", PROPS({ transitionMs: 300 })],
  },
  {
    // One template, two geometries. Lands as fan-out-landscape.mp4 +
    // fan-out-portrait.mp4 — emit:"multi" never writes the bare name.
    id: "@m0saic-starter/pipelines/fan-out/v1",
    out: "fan-out.mp4",
    args: ["-w", "640", "-h", "360", "--durationMs", "600"],
  },
  {
    // Frames, not video: {base}-{step}.png, zero-padded by the template.
    id: "@m0saic-starter/pipelines/png-sequence/v1",
    out: "png-sequence.png",
    args: ["-w", "320", "-h", "180", "--format", "image", "--props", PROPS({ frames: 3 })],
  },
  {
    // One master, three deliverables — the variants are transcodes, so the
    // -o path itself is renamed.
    id: "@m0saic-starter/pipelines/encode-matrix/v1",
    out: "encode-matrix.mp4",
    args: ["-w", "480", "-h", "270", "--durationMs", "600"],
  },
  {
    // Three mirrors, one decode. The caption prints the key the m0 handed
    // out — if it ever reads r/fc0 by hand, the cells go black.
    id: "@m0saic-starter/pipelines/ref-mirror/v1",
    out: "ref-mirror.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    // The back-edge: step 1's left cell IS step 0's pixels.
    id: "@m0saic-starter/pipelines/ref-across-steps/v1",
    out: "ref-across-steps.mp4",
    args: ["-w", "640", "-h", "360", "--durationMs", "800"],
  },
  {
    // Same mirror, different slot: fit reframes, loopMode fills the tail.
    id: "@m0saic-starter/pipelines/ref-reframe/v1",
    out: "ref-reframe.mp4",
    args: ["-w", "640", "-h", "360", "--durationMs", "800", "--props", PROPS({ fit: "cover", loopMode: "loop", tailMs: 400 })],
  },
  {
    // A whole pipeline behind one tile, deliberately short so loopMode fires.
    id: "@m0saic-starter/pipelines/nested-pipeline/v1",
    out: "nested-pipeline.mp4",
    args: ["-w", "640", "-h", "360", "--durationMs", "1200", "--props", PROPS({ innerMs: 600, loopMode: "freeze" })],
  },
  // ── data ─────────────────────────────────────────────────────
  {
    // Publishes upstream data + a .starterData.json sidecar beside the png.
    id: "@m0saic-starter/data/fixture-fetcher/v1",
    out: "fixture-fetcher.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    // Standalone on purpose: no upstream, so it reports MISSING and still
    // publishes a well-shaped empty block.
    id: "@m0saic-starter/data/pure-adapter/v1",
    out: "pure-adapter.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    // The fallback path — the card has to be drawable before a chain exists.
    id: "@m0saic-starter/data/data-card/v1",
    out: "data-card.png",
    args: ["-w", "640", "-h", "360", "--format", "image", "--props", PROPS({ title: "Latency" })],
  },
  {
    // Writes sidecar-json.renderFacts.json beside the still.
    id: "@m0saic-starter/data/sidecar-json/v1",
    out: "sidecar-json.png",
    args: ["-w", "640", "-h", "360", "--format", "image"],
  },
  {
    // Writes sidecar-text.captions.srt verbatim next to the still.
    id: "@m0saic-starter/data/sidecar-text/v1",
    out: "sidecar-text.png",
    args: ["-w", "640", "-h", "360", "--format", "image", "--props", PROPS({ format: "srt" })],
  },
];

function resolveCli() {
  const env = process.env.M0SAIC_CLI;
  if (env && env.trim().length > 0) {
    // A path to the CLI's built entry runs through node; a bare command runs as-is.
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
    console.error(
      `smoke-render: cannot find the m0saic CLI ("${cmd}"). Install it, or set M0SAIC_CLI to the CLI command/entry.`,
    );
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\nx ${label}`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
    return false;
  }
  console.log(`  ok ${label}`);
  return true;
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "template-manifest.json"), "utf8"),
);
const keys = (manifest.templates ?? []).map((t) => String(t.templateKey));

console.log(`smoke-render: pass 1 — validate-only sweep over ${keys.length} template(s)\n`);
let failures = 0;
for (const key of keys) {
  const ok = runCli(
    ["make", key, "--template-repo", ROOT, "-w", "640", "-h", "360", "--validate-only", "--quiet"],
    `validate ${key}`,
  );
  if (!ok) failures += 1;
}

console.log(`\nsmoke-render: pass 2 — ${SMOKE_RENDERS.length} tiny real render(s) into test-output/\n`);
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const smoke of SMOKE_RENDERS) {
  const outPath = path.join(OUT_DIR, smoke.out);
  const ok = runCli(
    ["make", smoke.id, "--template-repo", ROOT, ...smoke.args, "-o", outPath, "--quiet"],
    `render ${smoke.id} -> test-output/${smoke.out}`,
  );
  if (!ok) failures += 1;
}

if (failures > 0) {
  console.error(`\nsmoke-render: ${failures} failure(s)`);
  process.exit(1);
}
console.log(`\nsmoke-render: all green. Outputs in ${path.relative(process.cwd(), OUT_DIR) || "."}`);
