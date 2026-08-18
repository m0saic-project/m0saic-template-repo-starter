#!/usr/bin/env node
/**
 * stamp-ordinals — rewrite every curriculum ordinal from the ONE source of
 * order: chapter position in src/template-registry.ts + entry position in
 * each chapter's registry.ts.
 *
 * Inserting a chapter (or a lesson) mid-corpus renumbers everything after
 * it, in THREE places the generator asserts against each other: the
 * registry `title`, the template's `label`, and CURRICULUM.md's table rows.
 * This tool makes that a non-event:
 *
 *   node tools/stamp-ordinals.mjs          # rewrite all three surfaces
 *   node tools/stamp-ordinals.mjs --check  # exit 1 if anything would change
 *
 * It deliberately does NOT touch prose ("lesson 63", "58 and 59 pair up") —
 * cross-references in sentences are judgment calls; grep for `lesson \d` and
 * chapter-prose numerals after a renumber and fix those by hand.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);

// ── 1. Chapter order from template-registry.ts ─────────────────────────
const registrySrc = read("src/template-registry.ts");
const packs = [...registrySrc.matchAll(/\{\s*pack:\s*"([a-z-]+)",\s*entries:/g)].map((m) => m[1]);
if (packs.length === 0) {
  console.error("stamp-ordinals: no chapters found in src/template-registry.ts");
  process.exit(1);
}

// ── 2. Entries per chapter, in order ───────────────────────────────────
/** @type {Array<{pack: string, slug: string, file: string, registryFile: string}>} */
const entries = [];
for (const pack of packs) {
  const regFile = `src/${pack}/registry.ts`;
  const src = read(regFile);
  for (const m of src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)) {
    const slug = m[1];
    // Versioned dir: take the highest vN present.
    const dir = path.join(ROOT, "src", pack, slug);
    const versions = fs.readdirSync(dir).filter((d) => /^v\d+$/.test(d)).sort();
    const v = versions[versions.length - 1];
    entries.push({ pack, slug, file: `src/${pack}/${slug}/${v}/${slug}.ts`, registryFile: regFile });
  }
}

// ── 3. Stamp ───────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
let changed = 0;

const stampIn = (file, pattern, ordinal, what) => {
  let src = read(file);
  const m = src.match(pattern);
  if (!m) {
    console.error(`stamp-ordinals: no ${what} ordinal found in ${file}`);
    process.exitCode = 1;
    return;
  }
  const next = src.replace(pattern, (whole, pre, _old, rest) => `${pre}${pad(ordinal)}${rest}`);
  if (next !== src) {
    changed += 1;
    if (!CHECK) write(file, next);
    else console.log(`  would restamp ${what}: ${file}`);
  }
};

let curriculum = read("CURRICULUM.md");
let curriculumChanged = false;

entries.forEach((e, i) => {
  const ordinal = i + 1;
  // Registry title: `title: "NN · Name"`.
  stampIn(e.registryFile, new RegExp(`(slug:\\s*"${e.slug}",[\\s\\S]*?title:\\s*")(\\d+)( · )`), ordinal, `registry title for ${e.slug}`);
  // Template label: `label: "NN · Name"`.
  stampIn(e.file, /(label:\s*")(\d+)( · )/, ordinal, `label`);
  // CURRICULUM table row: `| NN | Name | \`pack/slug/vN\` |`.
  const rowRe = new RegExp(`(\\| )(\\d+)( \\| [^|]+ \\| \`${e.pack}/${e.slug}/v\\d+\` \\|)`);
  if (rowRe.test(curriculum)) {
    const next = curriculum.replace(rowRe, (whole, pre, _old, rest) => `${pre}${pad(ordinal)}${rest}`);
    if (next !== curriculum) {
      curriculum = next;
      curriculumChanged = true;
      changed += 1;
      if (CHECK) console.log(`  would restamp CURRICULUM row: ${e.pack}/${e.slug}`);
    }
  } else {
    console.error(`stamp-ordinals: no CURRICULUM.md table row for ${e.pack}/${e.slug}`);
    process.exitCode = 1;
  }
});

if (curriculumChanged && !CHECK) write("CURRICULUM.md", curriculum);

console.log(
  CHECK
    ? `stamp-ordinals --check: ${changed} surface(s) out of date${changed ? "" : " — clean"}`
    : `stamp-ordinals: ${entries.length} templates, ${changed} surface(s) restamped`,
);
if (CHECK && changed > 0) process.exit(1);
