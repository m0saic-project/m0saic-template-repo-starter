import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { evaluateM0, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  makeErrorMosaic,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/quality/below-the-floor/v1` — the two floors, and which
 * one you fell through.
 *
 * ONE CONCEPT: a layout has TWO independent minimum sizes, and missing them
 * fails in two completely different ways.
 *
 *   FEASIBILITY  will it render AT ALL?  Below it a split produces a 0-size
 *                frame and the engine refuses: SPLIT_EXCEEDS_AXIS. LOUD.
 *
 *   PRECISION    will it look RIGHT?     Below it every cell can no longer
 *                get its own pixel, so cells squash, spread, or vanish. It
 *                renders. Exit code 0. SILENT.
 *
 * The silent one is why this template exists. "It rendered" is not "it is
 * correct", and the gap between those two statements is a number you can
 * compute before drawing a single pixel.
 *
 * NEITHER FLOOR IS A FLOOR ON THE OTHER. They cross both ways: donation-heavy
 * layouts (like this one) sit far below their precision floor, while
 * deeply-nested same-axis layouts are the reverse. The number you actually
 * want is the FOLDED floor — the per-axis max of the two, which
 * `evaluateM0` reports as `recommendedMin`.
 *
 * ONE DESIGN, THREE STATES. Every mode draws the SAME three bands at the same
 * 10/10/80 proportions. Only the GRANULARITY changes — the same shape
 * expressed over more slots:
 *
 *   weightedSplit([S, S, 8S], "col", { mode: "literal" })
 *
 * `mode: "literal"` is load-bearing: the default reduces weights by their GCD,
 * which would collapse `[140,140,1120]` straight back to `[1,1,8]` and undo
 * the whole demonstration. Raising S leaves the picture identical and walks
 * the floors up past the canvas — precision first (it grows as 10·S), then
 * feasibility (roughly 4·S, since passthroughs donate and only the claimants
 * need their own pixel).
 *
 * The caption prints all three numbers at your actual canvas, so the two
 * failure modes are told apart by arithmetic instead of by squinting.
 *
 * DON'T GUESS — MEASURE. Every S here is derived from `ctx.target` and then
 * CHECKED with `evaluateM0` before rendering. The state is a property of
 * (design, canvas) together, never of the design alone: resize the canvas and
 * the same m0 changes state.
 */

export type BelowTheFloorMode = "fits" | "under-precision" | "unrenderable";

export type BelowTheFloorProps = {
  /** Which floor to sit above, or fall through. */
  mode?: BelowTheFloorMode;
  /** Band fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/below-the-floor/v1";
const MODES: BelowTheFloorMode[] = ["fits", "under-precision", "unrenderable"];

/**
 * Granularity per state, derived from the canvas.
 *
 *   precision  = 10·S   (total slots)
 *   feasibility ~ 4·S+1 (claimants + carry chain; passthroughs donate)
 *
 * so S past W/10 crosses precision, and S past W/4 crosses feasibility.
 * Verified against `evaluateM0` from 640x360 through 4K.
 */
function scaleFor(mode: BelowTheFloorMode, canvasW: number): number {
  switch (mode) {
    case "fits":
      return Math.max(2, Math.floor(canvasW / 160));
    case "under-precision":
      return Math.ceil(canvasW / 10) + 12;
    case "unrenderable":
      return Math.ceil(canvasW / 4) + 20;
  }
}

/**
 * A darker twin of a #rrggbb colour, so two equal-weight neighbours can be
 * told apart by eye. Deterministic integer math, no colour library.
 */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

/**
 * The design. Identical proportions at every scale — only slot count moves.
 * Returns the branded `M0String` straight from the builder (validated on the
 * way out), so the document never carries a bare string.
 */
function designM0(scale: number) {
  return weightedSplit([scale, scale, 8 * scale], "col", {
    mode: "literal",
    claimants: ["1", "1", "1{1}"],
  });
}

const propsSchema = definePropsSchema<BelowTheFloorProps>({
  mode: {
    type: "string",
    required: false,
    description:
      "fits: clears both floors. under-precision: renders but cells lose their pixel — the silent failure. unrenderable: feasibility refuses the m0 at this canvas.",
    meta: {
      constraints: { oneOf: MODES },
      ui: { label: "Mode", order: 1 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Band fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#c0392b" },
      ui: { label: "Band color", order: 2 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const BelowTheFloorV1 = defineMosaicTemplate<BelowTheFloorProps>({
  id: asTemplateId(ID),
  label: "69 · Below the Floor",
  version: 1,
  description:
    "A layout has two independent minimum sizes: feasibility (renders at all) and precision (looks right). One design, three states — clears both, clears only feasibility and quietly squashes, or falls through feasibility and is refused outright. The caption prints all three numbers at your canvas, so the loud failure and the silent one are told apart by arithmetic.",
  capabilities: { tier: "core" },
  tags: ["quality", "feasibility", "lesson"],

  /**
   * REQUIRED HERE, and a lesson in itself. Every render is auto-compacted:
   * the framework losslessly reduces splits to their minimum representation,
   * so `[8,8,64]` becomes `[1,1,8]` — a 10-slot m0 that draws the identical
   * picture. Excellent default, fatal to this template: the slot count IS
   * the subject, and compaction would quietly delete it, leaving the caption
   * describing an m0 the document no longer carries.
   *
   * (The failing modes survived compaction on their own, because below the
   * precision floor the reduction is no longer pixel-identical and the
   * compactor correctly declines — which is a neat proof that the floor is
   * real, and exactly the kind of half-working state that makes a bug hard
   * to see. Opt out explicitly rather than relying on that.)
   */
  skipAutoCompact: true,

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Walk Mode through all three, then resize — the state belongs to (design, canvas), not the design.",
  },

  propsSchema,
  defaultProps: {
    mode: "fits",
    bandColor: "#c0392b",
    pageColor: "#1c2833",
  },

  async render(
    props: BelowTheFloorProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["bandColor", props.bandColor],
      ["pageColor", props.pageColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const mode = (props.mode ?? "fits") as BelowTheFloorMode;
    if (!MODES.includes(mode)) {
      throw new Error(`${ID}: mode "${mode}" must be one of ${MODES.join(", ")}.`);
    }
    const { width, height } = ctx.target;
    const band = (props.bandColor ?? "#c0392b") as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    const scale = scaleFor(mode, width);
    const m0 = designM0(scale);

    // MEASURE, don't assume. This is the same call the app's Safe-Minimum
    // callout and the preview's below-floor chip read.
    const evalResult = evaluateM0(m0, { width, height });
    const { feasibility, feasible, precision, meetsPrecision, recommendedMin } =
      evalResult;

    const numbers = [
      `canvas ${width}x${height}`,
      `feasibility ${feasibility.minWidthPx}px`,
      `precision ${precision.maxSplitX}px`,
      `folded floor ${recommendedMin.width}px`,
    ].join("   ");

    // INFEASIBLE: the engine would raise SPLIT_EXCEEDS_AXIS on this m0 at this
    // canvas. Report instead of handing the renderer a document that dies —
    // a report card beats a dead preview, and it names the number to fix.
    if (!feasible) {
      return makeErrorMosaic(
        [
          `- feasibility floor is ${feasibility.minWidthPx}px wide; this canvas is ${width}px`,
          `- the split would produce a 0-size frame (SPLIT_EXCEEDS_AXIS)`,
          `- fix: raise the canvas to ${recommendedMin.width}x${recommendedMin.height}, or use fewer cells`,
        ].join("\n"),
        {
          width,
          height,
          title: "Unrenderable at this canvas",
          errorCode: "STARTER_BELOW_FEASIBILITY",
        },
      );
    }

    // Feasible. Either it also clears precision, or it is about to render
    // something that looks wrong without saying so.
    const verdict = meetsPrecision
      ? "FITS - clears both floors"
      : "UNDER PRECISION - renders, but cells cannot each hold a pixel. Silent.";

    const heading = fitSvgText(verdict, width * 0.86, height * 0.3, {
      maxPx: Math.round(height * (meetsPrecision ? 0.075 : 0.06)),
      maxLines: 2,
    });
    // Report MEASURED numbers, never recomputed ones — `precision.maxSplitX`
    // is the slot count of the m0 actually being shipped. `maxSpreadPx` is
    // the payoff line: 0 when balanced, and how far equal cells have drifted
    // apart once the layout is under the floor.
    const readout = fitSvgLines(
      [
        numbers,
        `slots ${precision.maxSplitX}   scale S=${scale}   spread ${evalResult.maxSpreadPx}px`,
      ],
      width * 0.86,
      height * 0.22,
      { maxPx: Math.round(height * 0.032), widthFrac: 0.9 },
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: page,
      // Three claimants: two narrow bands, then the wide one carrying the
      // readout on its attached overlay. Same three at every scale.
      //
      // The two narrow bands carry the SAME weight, so they should be
      // pixel-identical. They are deliberately different shades: adjacent
      // same-coloured cells merge into one block, and the whole point here
      // is being able to SEE them drift apart once the layout is under the
      // precision floor. `spread` in the readout is that drift, measured.
      sources: [
        makeColorTile(band),
        makeColorTile(shade(band)),
        makeColorTile(page),
        svgTextSource([
          {
            text: heading.text,
            fontSize: heading.fontSize,
            color: (meetsPrecision ? "#eaeef2" : "#f2a03d") as MosaicColor,
          },
          {
            text: readout.text,
            fontSize: readout.fontSize,
            color: "#7f8c9b" as MosaicColor,
            vAlign: "bottom",
            padding: { bottom: 0.1 },
          },
        ]),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Below the Floor",
    lines: [
      "Two independent floors. FEASIBILITY: renders at all, and below it the engine refuses - loud. PRECISION: looks right, and below it cells squash - silent.",
      "Neither is a floor on the other; they cross both ways. The number you want is the folded floor, the per-axis max, which evaluateM0 gives as recommendedMin.",
      "Every mode here draws the SAME design at the same proportions - only the slot count changes, walking the floors up past your canvas.",
    ],
    explore: [
      "Walk Mode through fits, under-precision, unrenderable",
      "Resize - the same m0 changes state, the numbers say why",
    ],
  }),
});

export default BelowTheFloorV1;
