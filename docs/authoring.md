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

Until the `@m0saic/*` substrate publishes to npm, building this repo needs a
checkout of the m0saic monorepo as a **sibling directory** (`../m0saic`) — the
`package.json` `file:` links resolve against it.

Without it you can still read the source, load the committed `dist/` in
Mosaic, and render every template. You cannot rebuild, test, or lint. See
[`../CONTRIBUTING.md`](../CONTRIBUTING.md).
