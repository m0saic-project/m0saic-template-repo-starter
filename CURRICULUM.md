# Curriculum

Fifty-seven templates in ten chapters. **One template teaches one thing** —
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

## media

Files, folders, probes, and time — the whole media prop pipeline, plus the
host's `ctx.media` ffprobe registry.

| # | Template | id |
|---|---|---|
| 19 | Image Card | `media/image-card/v1` |
| 20 | Folder Contact Strip | `media/folder-contact-strip/v1` |
| 21 | Probe Card | `media/probe-card/v1` |
| 22 | Time-Range Clip | `media/time-range-clip/v1` |
| 23 | Time-Ranges Medley | `media/time-ranges-medley/v1` |
| 24 | Luma Badge | `media/luma-badge/v1` |
| 25 | Play Speed | `media/play-speed/v1` |
| 26 | Audio Mix | `media/audio-mix/v1` |
| 27 | URL Asset | `media/url-asset/v1` |

## text

Text that renders identically in the app and the CLI. 28 puts the three glyph
pipelines side by side; the rest go deep on one each.

| # | Template | id |
|---|---|---|
| 28 | Text, Three Ways | `text/text-three-ways/v1` |
| 29 | Fit Text | `text/fit-text/v1` |
| 30 | Count Up | `text/count-up/v1` |
| 31 | Carved Type | `text/carved-type/v1` |

Nothing soft-wraps. Read 29 before you put a user-supplied string on a canvas.

## masks

There are no shape primitives. Every shape is a color tile wearing an SVG
path, authored against its own cell.

| # | Template | id |
|---|---|---|
| 32 | Shape Masks | `masks/shape-masks/v1` |
| 33 | Path Mask | `masks/path-mask/v1` |

## compose

Documents inside documents, and the refactor all of it enables.

| # | Template | id |
|---|---|---|
| 34 | Child Mosaic | `compose/child-mosaic/v1` |
| 35 | Rotate Headroom | `compose/rotate-headroom/v1` |
| 36 | Nested Template | `compose/nested-template/v1` |
| 37 | Nested Badge (internal) | `compose/nested-badge/v1` |
| 38 | Camera Follow | `compose/camera-follow/v1` |
| 39 | Theme Provider | `compose/theme-provider/v1` |
| 40 | Theme Tokens | `compose/theme-tokens/v1` |
| 41 | Reduce to One | `compose/reduce-to-one/v1` |

39 and 40 are a pair — the provider hands a theme down, the consumer takes it.
37 is a sub-template of 36 rather than a standalone lesson.

## pipelines

More than one document, and more than one file: steps, transitions, emit
single vs multi, encodes as a separate axis, and ref sources.

| # | Template | id |
|---|---|---|
| 42 | Two Scenes | `pipelines/two-scenes/v1` |
| 43 | Fan Out | `pipelines/fan-out/v1` |
| 44 | PNG Sequence | `pipelines/png-sequence/v1` |
| 45 | Encode Matrix | `pipelines/encode-matrix/v1` |
| 46 | Ref Mirror | `pipelines/ref-mirror/v1` |
| 47 | Ref Across Steps | `pipelines/ref-across-steps/v1` |
| 48 | Ref Reframe | `pipelines/ref-reframe/v1` |
| 49 | Nested Pipeline | `pipelines/nested-pipeline/v1` |

46–48 are a run on ref sources: mirror pixels inside a document, carry them
across a step boundary, then wear them differently. **Never hand-write a
`flattenedStableKey`** — compute it with `findStableKeys`. A wrong key renders
silently black and exits 0.

## data

Facts flowing through a render: publish a payload, reshape it, draw it, and
write files beside the deliverable.

| # | Template | id |
|---|---|---|
| 50 | Fixture Fetcher | `data/fixture-fetcher/v1` |
| 51 | Pure Adapter | `data/pure-adapter/v1` |
| 52 | Data Card | `data/data-card/v1` |
| 53 | Sidecar JSON | `data/sidecar-json/v1` |
| 54 | Sidecar Text | `data/sidecar-text/v1` |

50 → 51 → 52 is a chain, and **Make invokes one template at a time**, so
opening 51 or 52 alone shows them with nothing upstream — by construction.
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
| 55 | Render Lite | `surfaces/render-lite/v1` |
| 56 | Render Cover | `surfaces/render-cover/v1` |
| 57 | Render Tutorial | `surfaces/render-tutorial/v1` |

`renderLite` is the only one that falls back to `render` when absent; a cover
or tutorial that is not declared simply does not happen, and hosts never
synthesize one. 57 is the only template in the repo that builds its own
tutorial instead of using the standard page — doing that is what it teaches.

## quality

Knowing a template is **correct**, not just that it rendered. Two contract
tripwires that cost nothing until you turn them on.

| # | Template | id |
|---|---|---|
| 58 | Layout Contract Card | `quality/layout-contract-card/v1` |
| 59 | Geometry Contract Card | `quality/geometry-contract-card/v1` |
| 60 | Below the Floor | `quality/below-the-floor/v1` |
| 61 | Why the Floors Cross | `quality/why-the-floors-cross/v1` |

58 and 59 sit together because their identities differ, and the difference is
the lesson: a **label** survives every m0 the template regenerates and carries
canvas-independent ratios; a **stableKey** addresses one specific string
exactly and carries pixel assertions. Both wrappers return your document
untouched when `debug` is falsy, which is what lets the call stay in shipped
code.

60 is the one to read if you only read one. A layout has **two independent
minimum sizes** — feasibility (renders at all) and precision (looks right) —
and missing them fails in opposite ways: the engine refuses loudly, or it
renders something wrong and says nothing. One design walks all three states.

60 and 61 are a pair the same way 58 and 59 are. 60 shows the two floors and
how each one fails; 61 answers the question that follows — **for the layouts
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

---

## What is not here yet

The `watermark` chapter and an `examples/http-orchestrator` script. The corpus
is usable without them; they are additions, not gaps in what is already
taught.
