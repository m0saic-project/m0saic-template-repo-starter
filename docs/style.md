# Style — the law

House style for template code. It is short on taste and long on the rules that
are load-bearing: most entries here exist because breaking them fails
*silently*, not loudly.

`npm run verify` enforces the mechanical ones. The rest are review rules.

---

## Shape

**One template teaches one thing.** 60–150 lines. If it needs two concepts,
it is two templates.

**The doc-comment header is the lesson.** Every template opens with:

```ts
/**
 * `@<repo>/<pack>/<slug>/v1` — one line on what it draws.
 *
 * ONE CONCEPT: the single idea, stated plainly.
 *
 * The rule that bites: the thing that will cost someone an afternoon.
 */
```

Keep it **self-contained**. Never cite a path in the m0saic monorepo — readers
of this repo do not have it.

**A co-located `<slug>.test.ts` is mandatory**, and it asserts what the lesson
*claims*, not that the code ran. If the header says "the caption prints the
decision", a test reads the caption.

**No module-scope side effects.** No I/O, no clock, no registration at import.
The module defines an object; the host decides what to do with it.

## Determinism

Same inputs, same bytes. Every time.

- Never call `Math.random()` or read the clock. Randomness takes a **seed
  prop**; identical seeds produce identical output.
- Never read ambient state — env vars, cwd, the filesystem.
- `ctx.target` is the **only** source of size and duration.

**Size off `ctx.target`, never `ctx.output`.** They agree until your template
renders nested inside another document; then `target` is the slot you were
given while `output` still describes the whole deliverable. A nested template
reading `ctx.output` builds geometry for the wrong canvas — the classic silent
5× bug.

The one exception, in the other direction: a **tutorial owns its timing** and
must never read `ctx.target.durationMs`. Geometry from `ctx.target` is right;
duration is not. See `surfaces/render-tutorial/v1`.

## Props

- Every template declares a `propsSchema` via `definePropsSchema`. Optional
  props get deterministic defaults.
- **The schema is documentation; `render()` is the gate.** Validate in
  `render` and fail with a message naming the prop and the remedy. Do not
  assume the host validated anything.
- **Color props declare themselves.** Any `string` / `string[]` prop that is a
  color needs `constraints: { isColor: true }` **and**
  `control: { colorPicker: true }`. The app renders a swatch picker from
  those; without them the user gets a bare text box. Enforced repo-wide by
  `src/props-conventions.test.ts`.
- **File props are file props.** Use `type: "media"` with
  `control: { picker: "file", accept: ["video"] }` — not a `string` the user
  has to paste a path into.
- Give every prop `ui: { label, order }`. Control order is authored, not
  alphabetical.

## Drawing

**Real geometry first.** Carve cells and put content in them. Do not float
text over a full-canvas source because it was quicker. This applies to
onboarding content too — a cover's bands and a tutorial's diagram are known
rects.

**Static text uses the svg rasterizer** (`rasterizer: "svg"`): glyphs come
from the bundled deterministic font, baked to geometry, identical in the app
preview and the CLI. Fit it with the measured helpers — **nothing
soft-wraps**.

**Keep rendered copy ASCII.** The bundled glyph font draws `→ · — ×` as tofu.
Write `->`, not `→`. (Prose in *this* repo's markdown and in template `label`
fields is UI text and may use anything.)

**Svg text has no background.** Pair it with a `makeColorTile` base — the
attached `{...}` overlay is the usual home.

**Blank lines are not spacing.** `rasterizer: "svg"` drops them when drawing
*and* when measuring, so `"A\n\nB"` measures as `"A\nB"`. Paragraph gaps are
**geometry** — one rect per paragraph.

## The m0 string

- Build it with `@m0saic/dsl-stdlib` builders (`weightedSplit`, …) rather than
  string concatenation.
- A raw literal must be branded: `toM0String("1{1}", ID)`. It validates, and
  it names your template in the error when it does not.
- **Never guess a `flattenedStableKey`.** Compute it with `findStableKeys`. A
  wrong key renders **silently black** and exits 0.

## Module structure

Chapter `index.ts` files use **`export *` only**:

```ts
import { FooV1 } from "./foo/v1/foo";        // direct import for the array
export * from "./foo/v1/foo";                // re-export, on its own
```

Never pair `export * from "./x"` with a named `export { X } from "./x"` for
the same module. `tsc` emits a second `require()` for it, which Node's ESM→CJS
translation mis-serves on re-import — **silently filling template arrays with
`undefined`**.

**Never call `registerTemplate` yourself.** Export plain objects; the host
registers them. A self-registering external repo double-registers.

## Imports

Only packages in `dep-allowlist.json`. That list mirrors what a Mosaic host
actually resolves for an external repo — importing anything else compiles
locally and fails at load in the app.

All imports at the top of the file. No inline `import("...").Type`, no inline
`require()`.

## Naming and numbering

Every template carries its curriculum ordinal in **two** places — the registry
`title` and the template's own `label` (`"07 · Overlay Stack"`). The manifest
generator asserts both against array position, so removing or reordering a
lesson renumbers both or the build fails.

## Tutorials

Every template ships a `renderTutorial`. Use `lessonTutorial()` from
`src/_shared/tutorial.ts` — the one standard page — unless building the
tutorial *is* the lesson.

Copy is capped by `TUTORIAL_BUDGET` (4 lines / 160 chars per line / 480 total
/ 4 explore items / 72 chars each), **enforced at import**, so an over-long
tutorial fails the test run rather than overflowing its box in the app. The
budget exists because prose drifts: left to taste, every lesson grows a
paragraph per revision.

## Generated files

`dist/`, `template-manifest.json`, and `assets/templates/**` are **generated
and committed**. Never hand-edit them. Run `npm run build` (and
`npm run previews` for a new template), then commit the result.
