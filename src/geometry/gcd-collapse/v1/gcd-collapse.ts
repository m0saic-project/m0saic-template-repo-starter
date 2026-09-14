import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { quantizationSpread, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/gcd-collapse/v1` — identical proportions,
 * fraction of the string.
 *
 * ONE CONCEPT: GCD-COLLAPSE the weights. `[25, 50, 25]` and `[1, 2, 1]` are
 * the SAME proportions — dividing by the greatest common divisor changes
 * nothing visually, but the collapsed split has 4 slots instead of 100.
 * Fewer slots = shorter DSL, more pixels per weight unit (the ≥4 px/weight
 * rule of thumb), and a lower precision floor.
 *
 * The two rows spell the same proportions:
 *
 *   top     weightedSplit([25,50,25], "col", { mode: "literal" })   100 slots
 *   bottom  weightedSplit([25,50,25], "col")                          4 slots
 *
 * At a friendly canvas (width divisible by both) they render identically.
 * At a HOSTILE width, watch the seams: the 100-slot row's boundaries drift
 * visibly while the 4-slot row stays tight — quantization spread grows with
 * slot count (each slot needs its whole-pixel share; the ≥4 px-per-weight
 * rule of thumb exists exactly for this). Each row's label prints its slot
 * count, its DSL length, and its MEASURED spread at this very canvas.
 *
 * `"optimized"` is the DEFAULT mode — the builder GCD-collapses for you.
 * `"literal"` exists for byte-stable legacy strings; reaching for it is
 * almost always the wrong instinct.
 */

export type GcdCollapseProps = {
  /** The shared weights, before collapse. */
  weights?: number[];
};

const ID = "@m0saic-starter/geometry/gcd-collapse/v1";
const FILLS = ["#b03a2e", "#1e8449", "#b7950b"] as MosaicColor[];

const propsSchema = definePropsSchema<GcdCollapseProps>({
  weights: {
    type: "number[]",
    required: false,
    description:
      "Column weights shared by both rows (2-6 positive integers). Try [25,50,25] vs [1,2,1] — the optimized row emits the same string for both.",
    meta: { ui: { label: "Weights" } },
  },
});

export const GcdCollapseV1 = defineMosaicTemplate<GcdCollapseProps>({
  id: asTemplateId(ID),
  label: "06 · GCD Collapse",
  version: 1,
  description:
    "Two rows, same weights: literal mode keeps all 100 slots, the default optimized mode GCD-collapses to 4. At friendly widths they're identical; at hostile widths the 100-slot row's seams visibly drift while the 4-slot row stays tight. Labels print slots, DSL length, and the measured spread at this very canvas.",
  capabilities: { tier: "core" },
  tags: ["geometry", "quantization", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Render at an odd width (1031, 1279…) and watch the top row's seams drift off the bottom row's.",
  },

  propsSchema,
  defaultProps: { weights: [25, 50, 25] },

  async render(
    props: GcdCollapseProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const weights = props.weights ?? [25, 50, 25];
    if (
      weights.length < 2 ||
      weights.length > 6 ||
      weights.some((w) => !Number.isInteger(w) || w < 1)
    ) {
      throw new Error(
        `${ID}: weights must be 2-6 positive integers, got ${JSON.stringify(weights)}.`,
      );
    }

    const { width, height } = ctx.target;

    const literal = weightedSplit(weights, "col", { mode: "literal" });
    const optimized = weightedSplit(weights, "col"); // mode: "optimized" is the default

    const slotCount = (m0: string): number => {
      const match = /^(\d+)/.exec(m0);
      return match ? Number(match[1]) : 1;
    };

    // Two stacked rows of the same split, labels on the attached overlay.
    const m0 = toM0String(`2[${literal},${optimized}]{2[1,1]}`, ID);

    const rowFills = (): MosaicSource[] =>
      weights.map((_, i) => makeColorTile(FILLS[i % FILLS.length]));

    const halfH = Math.floor(height / 2);
    const label = (name: string, s: string): MosaicSource => {
      // The receipts: how far this row's tiles drift from their ideal
      // proportions AT THIS canvas (0 = exact).
      const spread = quantizationSpread(s, width, halfH).maxSpreadPx;
      return svgLabel(
        `${name}: ${slotCount(s)} slots, ${s.length} chars, spread ${spread.toFixed(1)}px`,
        width,
        halfH,
        { maxPx: Math.round(height * 0.045), vAlign: "bottom", padding: { bottom: 0.08 } },
      );
    };

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources: [
        ...rowFills(),
        ...rowFills(),
        label("literal", literal),
        label("optimized (default)", optimized),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "GCD Collapse",
    lines: [
      "[25,50,25] and [1,2,1] are the same proportions - dividing by the GCD drops 100 slots to 4 and changes nothing visually.",
      "Fewer slots means a shorter string, more pixels per weight unit (keep it >= 4), and a lower precision floor.",
      "At hostile widths the 100-slot row visibly drifts while the 4-slot row stays tight.",
    ],
    explore: [
      "Render at width 1031 and find the drifting seams",
      "Set Weights to [1,2,1] - both rows emit the same string",
      "Eye menu > Show dimensions to see per-tile pixels",
    ],
  }),
});

export default GcdCollapseV1;
