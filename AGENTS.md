# AGENTS.md

Entry point for coding agents working in this repo. Humans want
[`CURRICULUM.md`](CURRICULUM.md) and [`docs/authoring.md`](docs/authoring.md).

## What this repo is

A curriculum of 80 minimal m0saic templates, one concept each, plus a
committed zero-build distribution (`dist/` + `template-manifest.json`) that
Mosaic hosts load directly.

It is also the **reference for what good template code looks like**. Code you
add here is read as the house standard, so match the surrounding style rather
than importing habits from elsewhere.

## Read the machine index first

`template-manifest.json` is the complete inventory — every id, title,
description, pack, and preview path — as plain JSON. Read it instead of
crawling `src/`. It cannot go stale: the build regenerates it from the
registries and **asserts** it matches what `src/index.ts` exports.

```
template-manifest.json   → what exists (machine-readable, zero-exec)
CURRICULUM.md            → chapter map and reading order
src/<pack>/registry.ts   → the per-chapter descriptions the manifest is built from
docs/style.md            → the rules your code must satisfy
```

## Never hand-edit generated files

`dist/`, `template-manifest.json`, and `assets/templates/**` are generated and
committed. Editing them directly produces a repo that passes inspection and
fails at load, and the next `npm run build` silently discards your work.

To change what they contain, change `src/` and rebuild.

## The loop

```
npm run build      # tsc → dist/, then regenerate the manifest (the gate runs here)
npm run verify     # build + lint + jest + contract-check + dep policy
node tools/check-registry.mjs --json     # the gate's findings as JSON — loop on your own errors
node tools/check-registry.mjs --sweep    # + the standard 1080p canvases
```

Run `verify` before you claim anything works. It is the same gate a human
reviewer runs, and it catches the failures this codebase actually has:
manifest drift, a template registered but not exported, a disallowed import,
an ordinal that no longer matches its position. The build step itself runs
every template through the platform's **template conventions** twice
(`tools/check-registry.mjs`): at definition time — every optional knob shows
its default, colour props carry `isColor` + `colorPicker`, no absolute path
in `defaultProps`, a description and a tag, a `ui.label` per prop (warning)
— and again after rendering it at its defaults — it renders, every
`editor.binding` resolves against the schema, a free-text prop drawn as text
is bound to its rect (warning: "bind what you show"), every svg-drawn
character has a glyph, every svg text layer FITS its cell, rendering the
defaults twice gives the same document, the defaults pass their own schema,
and the layout clears its safe minimum at its own hinted canvas (warning;
`npm run conventions:sweep` also walks the 1080p canvases). Errors fail the
build and name the fix; warnings print. `--json` gives you every finding
with its fix as one object — read that instead of scraping the log.

**`tsc --noEmit` is a weaker signal than `npm run build`** here — the build
config differs, and things have passed the former while failing the latter.

For a new template you also need a preview asset, or `test:contract` fails:

```
npm run build && npm run previews && npm run build
```

(`previews` skips templates that already have assets, so it only mints yours.
The second build is what puts the new preview path into the manifest.)

For the whole shelf's health in one place — every render-time convention on
every standard canvas, plus a positioning probe (does the layout's safe
minimum track the canvas, i.e. absolute, or stay flat, i.e. ratio?):

```
npm run audit                 # markdown to stdout; read "⚠ Attention" first
npm run audit:write           # writes TEMPLATE-AUDIT.md
node tools/audit-templates.mjs --only <id-substring> --fast   # while iterating
```

## Scaffold, don't hand-roll

```
npm run new -- <pack>/<slug> --title "Human Title"
```

writes the template (typed props with defaults, a bound title, fitted copy,
deterministic geometry), its test (bindings, floors, determinism), the
registry row and the pack wiring — a NEW pack gets its files, the descriptor
in `src/repo.ts`, the chapter in `src/template-registry.ts` / `src/index.ts`
and a `## <pack>` section in CURRICULUM.md. It passes every gate convention
as generated; replace the body, keep the shape. Then
`npm run build && npm run previews && npm run build && npm run verify`.

## Layout fingerprints

Each template's flattened layout at its hinted canvas is committed as a
native `.m0` sidecar beside its source — `src/<pack>/<slug>/v1/<slug>.layout.m0`
(`# size:` is the canvas, `# title:` the id; it opens in the Layout page and
diffs line-for-line, in the same folder as the code that produced it). A
pipeline with several inline documents adds `<slug>.layout.step2.m0`, …. The build FAILS when a layout differs from its
fingerprint — so an edit to a shared helper shows its blast radius as a
diff, not a surprise. Intended change: `npm run fingerprints:update`, review
the diff, commit it with the change.

## From outside the build

`m0saic doctor <repo-dir> [--json] [--sweep]` runs the same conventions over
any template repo folder the way a host loads it — for a reviewer with a
fresh clone, a CI job, or an agent that does not own the build.

## Adding a template — the whole checklist

1. `src/<pack>/<slug>/v1/<slug>.ts` — read a neighbour in the same chapter
   first and mirror it.
2. `src/<pack>/<slug>/v1/<slug>.test.ts` — assert what the lesson claims.
3. Add it to `src/<pack>/registry.ts` (title carries the ordinal) **and**
   `src/<pack>/index.ts` (array + `export *`).
4. New chapter? Also add the pack to `src/repo.ts`, `src/template-registry.ts`,
   `src/index.ts`, and a `## <packid>` heading in `CURRICULUM.md`.
5. `npm run build && npm run previews && npm run build`.
6. `npm run verify`.

Appending to the end of the last chapter needs no renumbering. Inserting in
the middle renumbers every ordinal after it, in **both** the registry `title`
and the template `label` — the generator asserts both, so a half-done renumber
fails the build rather than shipping.

## Rules that fail silently

These are the ones worth loading into context before you write anything. Full
list in [`docs/style.md`](docs/style.md).

- **`ctx.target`, never `ctx.output`** — they agree until the template renders
  nested, then `output` is the wrong canvas.
- **Never guess a `flattenedStableKey`** — compute it with `findStableKeys`. A
  wrong key renders *silently black* and exits 0.
- **`export *` only** in chapter index files. Pairing it with a named
  re-export of the same module makes `tsc` emit a second `require()` that
  Node mis-serves, filling template arrays with `undefined`.
- **ASCII only in rendered copy** — the bundled glyph font draws `→` as tofu.
- **Blank lines are not spacing** — the svg rasterizer drops them when drawing
  *and* measuring. Gaps are geometry.
- **Determinism** — no `Math.random()`, no clock, no ambient state. Seeds are
  props.

## Verifying a render

The CLI renders from `dist/`, so **rebuild before you render** or you are
debugging code you already replaced.

```
m0saic make "@m0saic-starter/<pack>/<slug>/v1" --template-repo . -w 1280 -h 720 -o out.mp4
```

Quote the id — in PowerShell a bare `@` starts splatting. `list-templates`
cannot see external repos; use `make --validate-only` to check a template
exists and its props parse.

**Look at the output.** Exit 0 means ffmpeg ran, not that the picture is
right. Two defects shipped through green builds in this repo because nobody
opened the file: a reveal that is blank on its first frame, and a fail-fast
template whose browse card was its own error card.

## Scope

Do not add dependencies — `dep-allowlist.json` mirrors what a host actually
resolves, so a new import compiles locally and fails at load.

Do not restructure chapters, renumber the curriculum, or delete templates on
your own initiative. Those are editorial decisions about a published teaching
sequence.
