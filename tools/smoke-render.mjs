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
