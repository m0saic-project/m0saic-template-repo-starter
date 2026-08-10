import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { outsideInSizes } from "../../../_shared/geometry";
import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/predict-the-pixels/v1` — quantization is
 * arithmetic, not luck.
 *
 * ONE CONCEPT: the OUTSIDE-IN REMAINDER RULE. An equal split of N tiles on
 * an axis of T pixels gives every tile `floor(T/N)`, then hands the
 * remainder out one pixel at a time in index order 0, N-1, 1, N-2, … —
 * edges first, center last. It's exact and locked by test in the engine,
 * which means a template can compute its own tile widths BEFORE rendering.
 *
 * That's what this template does: each tile is labeled with the width the
 * rule predicts for it. Render at any canvas — the labels are always right.
 * Try 4 tiles at a 103px-wide canvas: `[26, 26, 25, 26]` — edges get the
 * spare pixels, the center absorbs the deficit.
 *
 * The layout trick worth stealing: the LESSON string stays pure
 * (`4(1,1,1,1)`), and the labels ride an attached overlay that mirrors the
 * same split — `4(1,1,1,1){4(1,1,1,1)}`. Base paints fills, overlay paints
 * text, geometry stays identical by construction.
 */

export type PredictThePixelsProps = {
  /** How many equal tiles to split into (2-12). */
  tileCount?: number;
};

const ID = "@m0saic-starter/geometry/predict-the-pixels/v1";

/** Two alternating tile fills + the label ink. */
const FILL_EVEN = "#21618c" as MosaicColor;
const FILL_ODD = "#2874a6" as MosaicColor;

const propsSchema = definePropsSchema<PredictThePixelsProps>({
  tileCount: {
    type: "number",
    required: false,
    description: "How many equal tiles to split into (2-12).",
    meta: {
      constraints: { min: 2, max: 12 },
      control: { step: 1 },
      ui: { label: "Tiles" },
    },
  },
});

export const PredictThePixelsV1 = defineMosaicTemplate<PredictThePixelsProps>({
  id: asTemplateId(ID),
  label: "Predict the Pixels",
  version: 1,
  description:
    "Every tile is labeled with the width the outside-in remainder rule predicts for it — floor(T/N) each, spare pixels to the edges first, center last. Render at any canvas and the labels are always right: quantization is arithmetic you can run ahead of time.",
  capabilities: { tier: "core" },
  tags: ["geometry", "quantization", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Try odd widths (1030, 1031…) and higher tile counts to watch the remainder walk outside-in.",
  },

  propsSchema,
  defaultProps: { tileCount: 4 },

  async render(
    props: PredictThePixelsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const count = props.tileCount ?? 4;
    if (!Number.isInteger(count) || count < 2 || count > 12) {
      throw new Error(`${ID}: tileCount must be an integer 2-12, got ${count}.`);
    }

    const { width, height } = ctx.target;
    // THE rule, run ahead of the render. sizes[i] is what tile i will
    // actually measure on screen.
    const sizes = outsideInSizes(width, count);

    const row = weightedSplit(new Array<number>(count).fill(1), "col");
    // Base row carries the fills; the attached overlay re-splits the same
    // canvas identically and carries one label per tile.
    const m0 = toM0String(`${row}{${row}}`, ID);

    const fills: MosaicSource[] = sizes.map((_, i) =>
      makeColorTile(i % 2 === 0 ? FILL_EVEN : FILL_ODD),
    );
    const labels: MosaicSource[] = sizes.map((px, i) =>
      svgLabel(`${px}px`, sizes[i], height, { maxPx: Math.round(height * 0.06) }),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [...fills, ...labels],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Predict the Pixels",
    lines: [
      "Equal splits follow the outside-in remainder rule: floor(T/N) pixels each, then the spare pixels go to indexes 0, N-1, 1, N-2, ... - edges first, center last.",
      "It is exact arithmetic, locked by an engine test - so this template computes every tile's width BEFORE rendering and labels it. The labels are always right.",
    ],
    explore: [
      "Custom size with an odd width like 1031",
      "Raise Tiles and watch the remainder walk outside-in",
      "Cross-check with eye menu > Show dimensions",
    ],
  }),
});

export default PredictThePixelsV1;
