#!/usr/bin/env node
/**
 * Provenance + regeneration for the committed media fixtures in assets/media/.
 * Needs an ffmpeg on PATH (or M0SAIC_FFMPEG pointing at one). The committed
 * files are the source of truth — this script exists so their recipes are
 * never lost and so they can be re-minted identically on any machine.
 *
 * Fixture inventory:
 *   epoch-m-1024x1024.png   m0saic brand mark still (~15 KB). Copied from the
 *                           m0saic project's fixture set — artwork, NOT
 *                           regenerable here; listed for provenance only.
 *   tone-440-320x240-2s.mp4 2s testsrc2 video + 440 Hz sine (~70 KB). The
 *                           one audio-bearing synthetic clip; same recipe as
 *                           the m0saic engine's capability fixtures.
 *   tile-*.png              solid 512x512 color tiles (one lavfi frame each).
 *   bbb-2s.mp4              2s of Big Buck Bunny (c) Blender Foundation,
 *                           CC-BY 3.0 — see NOTICE.md. Real-world media for
 *                           probe/clip/watermark examples. Transcoded from
 *                           the official download.blender.org source.
 *   bbb-frame-960x540.jpg   One 16:9 photographic frame, cut from the
 *                           committed bbb-2s.mp4 above (same CC-BY notice,
 *                           no second download). The corpus needs ONE
 *                           real-photo still: the brand-mark PNG is square,
 *                           so a cover-fit 16:9 demo crops it to nonsense,
 *                           and solid tiles have no luminance variety for
 *                           content-aware examples (media/luma-badge).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "assets", "media");
const FFMPEG = process.env.M0SAIC_FFMPEG || "ffmpeg";
const IS_WIN = process.platform === "win32";

// The official mirror serves the movies zip-wrapped; download → extract →
// transcode. `tar -xf` unpacks zip archives on both macOS and Windows 10+.
const BBB_SOURCES = [
  {
    url: "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_640x360.m4v.zip",
    inner: "BigBuckBunny_640x360.m4v",
  },
  {
    url: "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4.zip",
    inner: "BigBuckBunny_320x180.mp4",
  },
];

function ffmpeg(args, label) {
  const result = spawnSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
    shell: IS_WIN,
  });
  if (result.error && result.error.code === "ENOENT") {
    console.error(`regen-fixtures: ffmpeg not found ("${FFMPEG}"). Set M0SAIC_FFMPEG.`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`x ${label} failed`);
    return false;
  }
  console.log(`  ok ${label}`);
  return true;
}

fs.mkdirSync(MEDIA, { recursive: true });

// tone-440-320x240-2s.mp4 — deterministic synthetic AV clip.
ffmpeg(
  [
    "-f", "lavfi", "-i", "testsrc2=size=320x240:rate=30",
    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000",
    "-t", "2",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "28",
    "-c:a", "aac", "-b:a", "96k",
    "-shortest",
    path.join(MEDIA, "tone-440-320x240-2s.mp4"),
  ],
  "tone-440-320x240-2s.mp4",
);

// tile-<color>.png — solid color squares for collage/grid examples.
for (const [name, color] of [
  ["tile-red", "0xC0392B"],
  ["tile-blue", "0x2471A3"],
  ["tile-green", "0x1E8449"],
  ["tile-gold", "0xB7950B"],
]) {
  ffmpeg(
    ["-f", "lavfi", "-i", `color=c=${color}:size=512x512`, "-frames:v", "1", path.join(MEDIA, `${name}.png`)],
    `${name}.png`,
  );
}

// bbb-frame-960x540.jpg — a still cut from the committed clip. Derived, not
// downloaded: if bbb-2s.mp4 is present this always works offline. t=0.2s
// catches the "Big Buck Bunny" title at full opacity over the sunlit mound
// (it fades out across the clip — later seeks get a ghost of it), and its
// bottom-right badge corner reads bright (~206 luma) — the dark-on-light
// branch of media/luma-badge.
function mintBbbFrame() {
  const src = path.join(MEDIA, "bbb-2s.mp4");
  if (!fs.existsSync(src)) {
    console.error("  x bbb-frame-960x540.jpg: needs bbb-2s.mp4 first");
    return false;
  }
  return ffmpeg(
    [
      "-ss", "0.2", "-i", src, "-frames:v", "1",
      "-vf", "scale=960:540:flags=lanczos", "-q:v", "4",
      path.join(MEDIA, "bbb-frame-960x540.jpg"),
    ],
    "bbb-frame-960x540.jpg (from bbb-2s.mp4)",
  );
}

// bbb-2s.mp4 — 2s window from the official Big Buck Bunny release, scaled to
// 480x270. Seek lands at t=29s for visually rich frames (with title content).
async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, bytes);
  return bytes.length;
}

async function mintBbb() {
  const out = path.join(MEDIA, "bbb-2s.mp4");
  for (const src of BBB_SOURCES) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bbb-"));
    try {
      const zipPath = path.join(tmpDir, "bbb.zip");
      console.log(`  fetching ${src.url} (one-time, ~60-120 MB)…`);
      const size = await downloadTo(src.url, zipPath);
      console.log(`  fetched ${(size / 1024 / 1024).toFixed(0)} MB, extracting…`);
      const tar = spawnSync("tar", ["-xf", zipPath, "-C", tmpDir], {
        stdio: "inherit",
        shell: IS_WIN,
      });
      if (tar.status !== 0) throw new Error("tar -xf failed");
      const inner = path.join(tmpDir, src.inner);
      if (!fs.existsSync(inner)) throw new Error(`archive did not contain ${src.inner}`);
      const ok = ffmpeg(
        [
          "-ss", "29", "-i", inner, "-t", "2",
          "-vf", "scale=480:270:flags=lanczos",
          "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "27",
          "-c:a", "aac", "-b:a", "96k", "-ac", "2",
          "-movflags", "+faststart",
          out,
        ],
        `bbb-2s.mp4 (from ${src.inner})`,
      );
      if (ok) return true;
    } catch (err) {
      console.error(`  x ${src.url}: ${err.message}`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
  return false;
}

if (!(await mintBbb())) {
  console.error("x could not fetch any Big Buck Bunny source — check network access");
  process.exit(1);
}

// Derived from the clip above — must run after it.
mintBbbFrame();

console.log("\nregen-fixtures: done. Sizes:");
for (const f of fs.readdirSync(MEDIA).sort()) {
  const kb = (fs.statSync(path.join(MEDIA, f)).size / 1024).toFixed(0);
  console.log(`  ${f}  ${kb} KB`);
}
