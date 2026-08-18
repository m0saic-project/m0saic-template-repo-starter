# Curriculum

Seventy templates in thirteen chapters. **One template teaches one thing** —
read it top to bottom in a couple of minutes, then go turn its knobs in Make.

Chapter order is the teaching order, and so is the order within a chapter.
The numbers are curriculum ordinals; the build asserts that each template's
position, its registry title, and its `label` all agree, so a renumber can
never half-land.

Every template also ships:

- a co-located `.test.ts` that locks what the lesson claims,
- a `renderTutorial` — press the **?** pill in Make to read what it teaches
  and which knobs to poke,
- a preview asset, so it has a real picture on the Templates page.

Descriptions are deliberately **not** duplicated here. They live once, in each
chapter's `registry.ts`, and flow to `template-manifest.json` and the app —
one source, no drift. This file is the map.

> **Reading it as code:** `src/<pack>/<slug>/v1/<slug>.ts`. The doc-comment at
> the top of each file states the ONE concept and the rule that bites.

---

## basics

The smallest templates that still do everything right: a template object, the
hot-reload loop you will live in, color as the simplest source, and sizing off
`ctx.target`.

| # | Template | id |
|---|---|---|
| 01 | Hello World | `basics/hello-world/v1` |
| 02 | Hot-Reload Canary | `basics/hot-reload-canary/v1` |
| 03 | Color Tiles | `basics/color-tiles/v1` |
| 04 | Aspect-Adaptive Card | `basics/aspect-adaptive-card/v1` |

Start at 02 if you are setting up an edit loop — it exists to prove the loop
works before you trust it with real work.

## geometry

The m0 geometry contract, one rule per template. This is the chapter that
makes the DSL stop feeling arbitrary.

| # | Template | id |
|---|---|---|
| 05 | GCD Collapse | `geometry/gcd-collapse/v1` |
| 06 | Ratio vs Absolute | `geometry/ratio-vs-absolute/v1` |
| 07 | Overlay Stack | `geometry/overlay-stack/v1` |
| 08 | Lattice Gutters | `geometry/lattice-gutters/v1` |
| 09 | Inset Recovery | `geometry/inset-recovery/v1` |
| 10 | PlaceRect Dock | `geometry/place-rect-dock/v1` |
| 11 | Mask in a Cell | `geometry/mask-in-a-cell/v1` |
| 12 | Quantization: Three Cures | `geometry/quantization-cures/v1` |

## props

The typed props surface: every scalar type, seeded determinism, controls that
declare themselves to the app, and failing usefully instead of silently.

| # | Template | id |
|---|---|---|
| 13 | Typed Props Tour | `props/typed-props-tour/v1` |
| 14 | Seeded Shuffle | `props/seeded-shuffle/v1` |
| 15 | Color Props | `props/color-props/v1` |
| 16 | JSON Data Prop | `props/json-data-prop/v1` |
| 17 | Control Gallery | `props/control-gallery/v1` |
| 18 | Error Mosaic | `props/error-mosaic/v1` |

18 is the one to read before you ship anything: a thrown error is right for
headless, but a renderable report card is right for a person.

## controls

The rich editor tier — everything past a text box. The props chapter taught
the scalar surface; this one teaches the controls that make complex values
editable, and repeats one law in every lesson: **the control is edit-time
sugar** — render receives plain data, often in more than one legal shape,
and must normalize before drawing, because a hand-authored file deserves
exactly what the rich editor produces.

| # | Template | id |
|---|---|---|
| 19 | Static Options | `controls/static-options/v1` |
| 20 | Row Editors | `controls/row-editors/v1` |
| 21 | Number Series | `controls/number-series/v1` |
| 22 | Weights | `controls/weights/v1` |

19 draws the sharpest line in the chapter: `options` is presentation,
`constraints.oneOf` is validation, and they are independent — declare both
for a true closed set, options alone to keep values open. 20 and 21 are the
form-instead-of-JSON pair (repeating rows; tabbed series with the
flat-vs-nested round-trip). 22 is the auto-balancing weight group over a
fixed label set — and its grown-up sibling, weights composed with
connection-backed pickers, deliberately lives at the END of the curriculum
(`connections/weighted-cards`), where the upstream context it needs exists.

## media

Files, folders, probes, and time — the whole media prop pipeline, plus the
host's `ctx.media` ffprobe registry.

| # | Template | id |
|---|---|---|
| 23 | Image Card | `media/image-card/v1` |
| 24 | Folder Contact Strip | `media/folder-contact-strip/v1` |
| 25 | Probe Card | `media/probe-card/v1` |
| 26 | Time-Range Clip | `media/time-range-clip/v1` |
| 27 | Time-Ranges Medley | `media/time-ranges-medley/v1` |
| 28 | Luma Badge | `media/luma-badge/v1` |
| 29 | Play Speed | `media/play-speed/v1` |
| 30 | Audio Mix | `media/audio-mix/v1` |
| 31 | URL Asset | `media/url-asset/v1` |

## text

Text that renders identically in the app and the CLI. 32 puts the three glyph
pipelines side by side; the rest go deep on one each.

| # | Template | id |
|---|---|---|
| 32 | Text, Three Ways | `text/text-three-ways/v1` |
| 33 | Fit Text | `text/fit-text/v1` |
| 34 | Count Up | `text/count-up/v1` |
| 35 | Carved Type | `text/carved-type/v1` |

Nothing soft-wraps. Read 29 before you put a user-supplied string on a canvas.

## masks

There are no shape primitives. Every shape is a color tile wearing an SVG
path, authored against its own cell.

| # | Template | id |
|---|---|---|
| 36 | Shape Masks | `masks/shape-masks/v1` |
| 37 | Path Mask | `masks/path-mask/v1` |

## compose

Documents inside documents, and the refactor all of it enables.

| # | Template | id |
|---|---|---|
| 38 | Child Mosaic | `compose/child-mosaic/v1` |
| 39 | Rotate Headroom | `compose/rotate-headroom/v1` |
| 40 | Nested Template | `compose/nested-template/v1` |
| 41 | Nested Badge (internal) | `compose/nested-badge/v1` |
| 42 | Camera Follow | `compose/camera-follow/v1` |
| 43 | Theme Provider | `compose/theme-provider/v1` |
| 44 | Theme Tokens | `compose/theme-tokens/v1` |
| 45 | Reduce to One | `compose/reduce-to-one/v1` |

43 and 44 are a pair — the provider hands a theme down, the consumer takes it.
41 is a sub-template of 40 rather than a standalone lesson.

## pipelines

More than one document, and more than one file: steps, transitions, emit
single vs multi, encodes as a separate axis, and ref sources.

| # | Template | id |
|---|---|---|
| 46 | Two Scenes | `pipelines/two-scenes/v1` |
| 47 | Fan Out | `pipelines/fan-out/v1` |
| 48 | PNG Sequence | `pipelines/png-sequence/v1` |
| 49 | Encode Matrix | `pipelines/encode-matrix/v1` |
| 50 | Ref Mirror | `pipelines/ref-mirror/v1` |
| 51 | Ref Across Steps | `pipelines/ref-across-steps/v1` |
| 52 | Ref Reframe | `pipelines/ref-reframe/v1` |
| 53 | Nested Pipeline | `pipelines/nested-pipeline/v1` |

50–52 are a run on ref sources: mirror pixels inside a document, carry them
across a step boundary, then wear them differently. **Never hand-write a
`flattenedStableKey`** — compute it with `findStableKeys`. A wrong key renders
silently black and exits 0.

## data

Facts flowing through a render: publish a payload, reshape it, draw it, and
write files beside the deliverable.

| # | Template | id |
|---|---|---|
| 54 | Fixture Fetcher | `data/fixture-fetcher/v1` |
| 55 | Pure Adapter | `data/pure-adapter/v1` |
| 56 | Data Card | `data/data-card/v1` |
| 57 | Sidecar JSON | `data/sidecar-json/v1` |
| 58 | Sidecar Text | `data/sidecar-text/v1` |

54 → 55 → 56 is a chain, and **Make invokes one template at a time**, so
opening 55 or 56 alone shows them with nothing upstream — by construction.
`examples/data-chain/starter-data-chain.mosaicx` is the only way to see the
lesson whole:

```
m0saic make examples/data-chain/starter-data-chain.mosaicx --template-repo . -o chain.mp4
```

## surfaces

The entry points past `render` — real `MosaicTemplate` members that hosts
dispatch, all editor-only and all opt-in.

| # | Template | id |
|---|---|---|
| 59 | Render Lite | `surfaces/render-lite/v1` |
| 60 | Render Cover | `surfaces/render-cover/v1` |
| 61 | Render Tutorial | `surfaces/render-tutorial/v1` |

`renderLite` is the only one that falls back to `render` when absent; a cover
or tutorial that is not declared simply does not happen, and hosts never
synthesize one. 61 is the only template in the repo that builds its own
tutorial instead of using the standard page — doing that is what it teaches.

## quality

Knowing a template is **correct**, not just that it rendered. Two contract
tripwires that cost nothing until you turn them on.

| # | Template | id |
|---|---|---|
| 62 | Layout Contract Card | `quality/layout-contract-card/v1` |
| 63 | Geometry Contract Card | `quality/geometry-contract-card/v1` |
| 64 | Below the Floor | `quality/below-the-floor/v1` |
| 65 | Why the Floors Cross | `quality/why-the-floors-cross/v1` |

62 and 63 sit together because their identities differ, and the difference is
the lesson: a **label** survives every m0 the template regenerates and carries
canvas-independent ratios; a **stableKey** addresses one specific string
exactly and carries pixel assertions. Both wrappers return your document
untouched when `debug` is falsy, which is what lets the call stay in shipped
code.

64 is the one to read if you only read one. A layout has **two independent
minimum sizes** — feasibility (renders at all) and precision (looks right) —
and missing them fails in opposite ways: the engine refuses loudly, or it
renders something wrong and says nothing. One design walks all three states.

64 and 65 are a pair the same way 62 and 63 are. 64 shows the two floors and
how each one fails; 65 answers the question that follows — **for the layouts
you actually build, which number is the one to watch, and why does it land in
the hundreds?** It teaches in two registers. Synthetic shapes show the
mechanism: one stat card is precision-high on its own; six in a strip and
feasibility multiplies past it — the floors cross at the nesting step, safe
minimum 680×100. A sidebar speced in design pixels (320 of a 1440 frame)
bakes the design resolution into the ruler: pixel-true only at 1440, silently
off at 1280. Then the real thing: **captured production m0, shipped bare as
sidecars** and rendered as wireframes — the kpi strip's flattened 22,988
chars measure 934×117 feasibility vs 193×121 precision, theming's measure
1920×1080 precision vs 663×313 feasibility, and the template's tests lock
those numbers. The floors belong to the shape, not the canvas — and they are
the floors of the **flattened** layout, the form render actually runs.

## connections

Teaching the host an upstream backend — and what Make gains from it. The
neutral upstream is `examples/http-orchestrator` (a zero-dep local catalog
server; its README shows how to point the connection at YOUR backend
instead).

| # | Template | id |
|---|---|---|
| 66 | Host Connection | `connections/host-connection/v1` |
| 67 | Options From a Connection | `connections/options-select/v1` |
| 68 | Cards Picker | `connections/cards-picker/v1` |
| 69 | Connection Multi-Select | `connections/multi-select/v1` |
| 70 | Weighted Cards | `connections/weighted-cards/v1` |

66 registers `starter-catalog@default`: the Settings → Integrations form (a
base URL plus a keychain-stored key) and the Test-connection probe's two
ticks. Registration is a module-eval side effect — the chapter's one
deliberate exception to "no self-registration" — and it is part of the
Add-source consent surface (`docs/security.md`).

The pickers rise in richness: live-fetched options resolved through the
**`connectionId` sibling wire** (the prop every connection-backed control
reads its profile from), an artwork card grid whose images resolve lazily
as data URIs, cardList chips whose picker modal arrives sectioned by an
option field, and finally weighted cards — the controls chapter's weight
machinery composed with the connection pickers, weighing chips within a
card and cards against each other. The chapter's through-line: **the
connection enriches edit time only** — at render every prop is plain data,
identical whether it was picked from a rich modal or typed by hand.

---

## What is not here yet

The `watermark` chapter (decision pending — its techniques are expressions
of knobs the corpus already teaches, so it may stay cut). The corpus is
usable without it.
