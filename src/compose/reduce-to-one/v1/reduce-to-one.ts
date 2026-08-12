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

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/compose/reduce-to-one/v1` — the same picture, spelled two
 * ways, with the receipts printed on it.
 *
 * ONE CONCEPT: "reduce to 1" is a refactor. When a subtree gets dense or
 * precision-hungry, move it into a child mosaic and the parent collapses to
 * a single frame. The pixels don't change. What changes is the size of the
 * string the parent has to carry, and — the real prize — which precision
 * tier each half lives in.
 *
 * Flip `mode` and read the caption:
 *
 *   - "flat": the whole grid is spelled inline. The parent's m0 grows with
 *     the density, every cell competing for the same quantization budget as
 *     the chrome around it.
 *   - "reduced": the parent is ONE cell plus a `children` entry. The grid
 *     still renders, at the same density, from a document that owns its own
 *     coordinate space and its own declared size.
 *
 * WHEN this is worth it: high DSL count in the dense part, chrome that wants
 * to stay resolution-independent, or a subtree whose pixel math you want
 * isolated from everything else. WHEN IT ISN'T: a cheap subtree — you have
 * traded one string for one extra encode pass, and the pass isn't free.
 *
 * The next move after this one is baking: if the reduced child is also
 * IDENTICAL on every render (no props, no data), pre-render it once and
 * reference a flat asset instead. Reduce first, bake last — and only once
 * the look is locked, because baking freezes it.
 */

export type ReduceToOneProps = {
  /** How the same picture is spelled. */
  mode?: "flat" | "reduced";
  /** Grid density: N×N cells either way. */
  density?: number;
};

const ID = "@m0saic-starter/compose/reduce-to-one/v1";
const MODES = ["flat", "reduced"] as const;
const CHILD_REF = "field";
const INK_DIM = "#7f8c9b" as MosaicColor;
const FIELD_A = "#1a5276" as MosaicColor;
const FIELD_B = "#2471a3" as MosaicColor;

const propsSchema = definePropsSchema<ReduceToOneProps>({
  mode: {
    type: "string",
    required: false,
    description:
      "\"flat\": the grid is spelled inline, so the PARENT's m0 grows with the density. \"reduced\": the grid moves into a child and the parent collapses to one cell — same pixels, different string.",
    meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
  },
  density: {
    type: "number",
    required: false,
    description: "Grid density (N×N cells). Raise it and watch only ONE of the two spellings get longer.",
    meta: {
      constraints: { min: 2, max: 12 },
      control: { step: 1 },
      ui: { label: "Density" },
    },
  },
});

export const ReduceToOneV1 = defineMosaicTemplate<ReduceToOneProps>({
  id: asTemplateId(ID),
  label: "41 · Reduce to One",
  version: 1,
  description:
    "The same grid spelled two ways: inline (the parent's m0 grows with the density) or pushed into a child (the parent stays one cell). Identical pixels, and the caption prints both string lengths so the refactor's cost and benefit are numbers.",
  capabilities: { tier: "core" },
  tags: ["compose", "complexity", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Raise Density with mode \"flat\", then flip to \"reduced\" and compare the m0 lengths.",
  },

  propsSchema,
  defaultProps: { mode: "flat", density: 6 },

  async render(
    props: ReduceToOneProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const mode = props.mode ?? "flat";
    const density = props.density ?? 6;

    const problems: string[] = [];
    if (!MODES.includes(mode as (typeof MODES)[number])) {
      problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
    }
    if (!Number.isInteger(density) || density < 2 || density > 12) {
      problems.push(`density must be a whole number 2-12, got ${JSON.stringify(density)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // The dense part, as a string — identical in both modes. The only
    // question is WHO carries it.
    const ones = new Array(density).fill(1);
    const gridRow = String(
      weightedSplit(ones, "col", { claimants: new Array(density).fill("1") }),
    );
    const grid = String(weightedSplit(ones, "row", { claimants: new Array(density).fill(gridRow) }));

    const cells: MosaicSource[] = [];
    for (let r = 0; r < density; r++) {
      for (let c = 0; c < density; c++) {
        cells.push(makeColorTile((r + c) % 2 === 0 ? FIELD_A : FIELD_B));
      }
    }

    // Both modes: the field on top, a caption band underneath. Only the top
    // cell's spelling differs.
    const fieldBox = { width, height: Math.round((height * 5) / 6) };
    const children: Record<string, MosaicDocument> = {};
    let topCell: string;
    let sources: MosaicSource[];

    if (mode === "reduced") {
      children[CHILD_REF] = {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String(grid, `${ID}:child`),
        assets: {},
        size: fieldBox,
        sources: cells,
      };
      topCell = "1";
      sources = [{ type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } } as MosaicSource];
    } else {
      topCell = grid;
      sources = [...cells];
    }

    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [topCell, "1"] })),
      ID,
    );

    // The receipts. Same cell count, same picture; two very different
    // strings for the parent to carry.
    const flatLength = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [grid, "1"] })),
      `${ID}:measure`,
    ).length;
    const caption =
      `${mode}: parent m0 ${m0.length} chars for ${density}x${density} = ${density * density} cells` +
      (mode === "reduced"
        ? ` (flat would be ${flatLength}) - the grid moved into a child with its own ${fieldBox.width}x${fieldBox.height} space`
        : ` - reduced would be ${
            toM0String(String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })), `${ID}:measure`)
              .length
          }, at the cost of one extra encode pass`);

    sources.push(
      svgLabel(caption, width, Math.round(height / 6), {
        maxPx: Math.round(height * 0.028),
        maxLines: 2,
        color: INK_DIM,
      }),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      ...(mode === "reduced" ? { children } : {}),
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Reduce to One",
    lines: [
      "\"Reduce to 1\" is a refactor: move a dense subtree into a child and the parent collapses to one frame.",
      "The pixels do not change. What changes is the string the parent carries - and which precision tier each half lives in.",
      "Worth it for a dense, precision-hungry subtree; not for a cheap one, where you just bought an extra encode pass.",
      "The move after this one is baking: if the child never varies, pre-render it once and reference a flat asset.",
    ],
    explore: [
      "Raise Density to 12 in flat and watch the parent m0 climb",
      "Flip to reduced: same picture, parent m0 back to a few chars",
      "Structure dock: one deep tree versus two shallow ones",
      "Compare with compose/child-mosaic - same mechanism, other reason",
    ],
  }),
});

export default ReduceToOneV1;
