# Authoring

How a template gets from your editor into a render. The rules your code must
satisfy are in [`style.md`](style.md); this is the mechanics.

---

## The loader contract

A Mosaic host imports **`dist/index.js`** and reads two exports:

```js
exports.repo       // MosaicTemplateRepoDescriptor — who this repo is
exports.templates  // MosaicTemplate[] — what to register
```

`getTemplates()` is accepted in place of `templates` for repos that want lazy
loading. Nothing else is required.

Three consequences worth internalising:

- **The host registers, not you.** Export plain objects. A repo that calls
  `registerTemplate` itself double-registers.
- **`src/` is never read at load time.** Hosts load `dist/`. If you did not
  build, the host is running your previous code.
- **`template-manifest.json` mirrors `templates`** so the app can populate its
  browse UI *without executing anything*. The generator asserts the two agree,
  so a template cannot ship unregistered and a registry row cannot outlive its
  template.

## CommonJS, and one hazard

The build emits CommonJS (`module: "commonjs"`, `moduleResolution: "Node10"`,
`target: "es2019"`). There is no `"type": "module"`.

In chapter `index.ts` files use **`export *` only**:

```ts
import { FooV1 } from "./foo/v1/foo";   // for the templates array
export * from "./foo/v1/foo";           // re-export
```

Never pair `export * from "./x"` with `export { X } from "./x"` for the same
module. `tsc` emits a second `require()`, Node's ESM→CJS translation
mis-serves it on re-import, and your template array silently fills with
`undefined`. Nothing errors; templates just vanish.

## What `render` returns

A **document**:

```ts
{
  kind: "mosaic_document",
  version: 1,
  m0,                        // branded M0String
  assets: {},                // id → { kind: "file", path, mediaType }
  sources: [ /* one per claimed cell, in DSL walk order */ ],
  backgroundColor?, size?, fps?, durationMs?,
}
```

or a **pipeline**:

```ts
{
  kind: "mosaic_pipeline",
  version: 1,
  fps, durationMs,           // total = sum of the steps
  defaultTransition: { type: "cut" },
  steps: [{ name, durationMs, file /* a document */ }],
}
```

**Sources bind in DSL walk order** — base tile, then its attached overlay,
then the next cell. Get that order wrong and colors land on the wrong tiles
with no error.

## Size and duration come from `ctx.target`

`ctx.target` is `{ width, height, fps, durationMs }` — the canvas *this
invocation* fills. Branch on it freely.

Use it, not `ctx.output`. They agree until your template renders nested inside
another document, at which point `target` is the slot you were given and
`output` still describes the final deliverable. See
`basics/aspect-adaptive-card/v1`.

## The other three entry points

`render` is required and is the only one the CLI ever calls. The rest are
editor-only and opt-in:

| | called when | absent |
|---|---|---|
| `renderLite` | preview / design hot path | falls back to `render` |
| `renderCover` | pure-default first open | nothing happens |
| `renderTutorial` | the user clicks the **?** pill | nothing happens |

Only `renderLite` falls back. A cover or tutorial you do not declare simply
does not occur — hosts never synthesize one.

All three must be deterministic, side-effect-free, and **must not read
`ctx.media`** (hosts pass an empty registry, so no probe pass runs). Worked
examples: the `surfaces` chapter.

## The edit loop

```
edit → npm run build → Templates page → Refresh repos
```

Prove the loop works before trusting it: open
`@m0saic-starter/basics/hot-reload-canary/v1`, flip its constant, rebuild,
press **Refresh repos**. The square changes color with no app restart. That
template exists for exactly this.

Templates hot-reload from `dist/`. The Electron main process does not — if you
are hacking on a host, that needs a restart.

## The Make handshake — prop bindings

Make's preview is an editor: double-click a rect and the prop it displays
opens for editing right there. The template says which rect shows which
prop, on the source, once:

```ts
bindProp(svgLabel(props.title, w, h, opts), "title");          // free text (or a number)
bindProp(makeColorTile(props.accent), "accent");               // a colour string: Make opens a picker
bindProps(svgTextSource([head, sub]), [                        // one rect, two knobs (a stacked form)
  { propKey: "title", layer: 0 },
  { propKey: "subtitle", layer: 1 },
]);
bindProp(src, "bullets", i);                                   // one element of a string[] / number[]
bindPropPath(src, "rows", [i, "value"], "number");             // a leaf of a json / list prop, with its kind
bindPropRange(src, "code", undefined, lineSpan, tokenSpan);    // one line of a multi-line string
```

That is **provenance**: the rect knows which knob drew it. Make derives the
prop -> rect map from the bindings on every render, so the per-render
`stableKey` is never authored (the geometry may re-key; the binding rides
the source). Which props are bindable is decided once, in the platform —
free text, numbers, colours, one element of a list, a typed leaf of a
structured prop. Closed pickers (`oneOf`, `options`, connection-backed
selects), media, booleans and whole lists are not, and a rect bound to one
gets no pencil.

Rules the build gate enforces (`tools/check-registry.mjs`, stage 2):

- **`bindingsSound` (error):** every binding resolves — the prop exists, is
  bindable, a list binding carries an index, a structured binding a path AND
  a kind.
- **`bindingsCover` (warning):** a free-text prop whose value is drawn as
  text is bound to the rect that shows it. Bind the rect that SHOWS the
  value, not derived text, and bind it even when the value is empty — the
  empty rect is the "add" handle.

Lock it in the lesson's test with `resolvePropBindings(doc, w, h,
{ propsSchema })`: `rejected` is empty, `byProp` has every knob you bound.
Lesson: `make/prop-bindings/v1`.

## Scaffolding a template

`npm run new -- <pack>/<slug> --title "Human Title"` writes a template that
already passes every build-gate convention, its test, and all the wiring
(registry row, pack index, and for a new pack the descriptor, chapter and
curriculum section). Edit the body; the header comment is the lesson.

## Layout fingerprints

Every template's flattened layout at its hinted canvas is committed as a
native `.m0` sidecar beside its source, `src/<pack>/<slug>/v1/<slug>.layout.m0`
(the `# size:` header is the canvas, `# title:` the template id; a pipeline
with several inline documents adds `<slug>.layout.step2.m0`, …). A template
whose id has no matching source folder falls back to `layout-fingerprints/`. The build compares and FAILS on a change, so a
refactor of a shared helper cannot silently move a hundred rects. When the
change is intended, `npm run fingerprints:update` re-mints the files; commit
them with the change and the diff is the review.

## Checking from outside the build

`m0saic doctor <repo-dir>` (add `--json` for tooling, `--sweep` for the
standard canvases) loads a repo the way Mosaic does and prints every
convention finding with its fix, fingerprints included. Same law as
`npm run build`, no build required.

## Auditing the shelf

`npm run audit` renders every core-tier template at its defaults and writes
one markdown report (`--write` → `TEMPLATE-AUDIT.md`): the build gate's
render-time conventions on the hinted canvas AND the standard 1080p
landscape / portrait / square canvases, plus a positioning probe across
square / portrait / desktop × 240p–4K. Each cell is the layout's **safe
canvas** (the smallest size that renders and looks right); a cell marked ⚠
is a probe canvas below it. A safe canvas that climbs with the canvas means
absolute positioning (a head — it does not nest); one that stays flat means
ratio (it composes). Read the "⚠ Attention" table first; it is the to-do
list. `--only <substring> --fast` scopes it while you iterate.

## Rendering from the CLI

```
m0saic make "@m0saic-starter/basics/hello-world/v1" --template-repo . -w 1280 -h 720 -o out.mp4
```

- **Quote the id.** In PowerShell a bare `@` starts splatting.
- **Rebuild first.** The CLI renders `dist/`.
- `list-templates` does not see external repos. To check a template exists and
  its props parse, use `make --validate-only`.
- `--props '{"...":"..."}'` overrides defaults. On Windows, prefer
  `--props-file` — shell quoting of JSON differs enough to waste an afternoon.

`node tools/smoke-render.mjs` sweeps every template with `--validate-only`,
then renders a curated handful into `test-output/` for eyeballing.

## Previews

Every template needs a preview asset or `npm run test:contract` fails:

```
npm run build && npm run previews && npm run build
```

`previews` skips templates that already have one. The trailing build is what
writes the new path into the manifest. Budgets are hard — 150 KB for
`preview.png`, 1 MB for `preview.mp4`; a photographic frame usually needs a
smaller canvas via `PREVIEW_DIMS` in `tools/gen-previews.mjs`.

**Then look at it.** A still is rendered at `t=0`, which is blank for any
animation that reveals from nothing, and it uses *default* props, which for a
fail-fast template means its browse card is an error card. Both have happened
here. `ANIMATED_PREVIEW_IDS`, `STILL_FROM_VIDEO`, and `PREVIEW_OVERRIDES`
exist to fix exactly those.

## Author-mode prerequisites

Node 20+ and `npm install`. The `@m0saic/*` substrate the build needs is on
npm at the ranges `package.json` declares; nothing links to a local checkout.
`m0saic doctor .` (the CLI) runs the same checks as the build from outside it.

Without an install you can still read the source, load the committed `dist/`
in Mosaic, and render every template with the CLI. See
[`../CONTRIBUTING.md`](../CONTRIBUTING.md).
