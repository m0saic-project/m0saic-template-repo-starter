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
 * `@m0saic-starter/compose/child-mosaic/v1` — a whole document inside one
 * tile.
 *
 * ONE CONCEPT: `children` is a map of complete `MosaicDocument`s, and a
 * `{ type: "mosaic", ref }` source says "this tile's content is that
 * document". Evaluation is BOTTOM-UP: every child renders first, into its
 * own framebuffer, and the parent then treats the result as media.
 *
 * Two consequences, both load-bearing:
 *
 *   1. THE PARENT'S m0 NEVER GROWS. The DSL is shape; `children` is
 *      content. Turn the child's grid from 2×2 to 5×5 and the parent's
 *      string is still `2(1,1)` — the complexity moved a level down instead
 *      of into the string. (That is also the whole trick behind
 *      compose/reduce-to-one.)
 *   2. A finite framebuffer CLIPS. Anything the child paints past its own
 *      edge has nowhere to land, which is why wrapping a moving overlay in a
 *      child is the structural fix for pixels that bleed out of their cell.
 *
 * And one rule that only bites procedural children (lavfi / text / masks —
 * no media inside to measure): the child's aspect is inferred, and with
 * nothing to infer FROM it falls back to the parent tile's shape. Declare
 * `size` on the child and the engine trusts it as the natural aspect, then
 * fits it into the tile like any other media. Flip `Declare child size` and
 * watch square cells stop being square.
 */

export type ChildMosaicProps = {
  /** The child's grid: N×N cells, all inside ONE parent tile. */
  childGrid?: number;
  /** Give the child its own square `size` (its only aspect signal). */
  declareChildSize?: boolean;
};

const ID = "@m0saic-starter/compose/child-mosaic/v1";
const CHILD_REF = "grid";
const PANEL = "#17202a" as MosaicColor;
const CHILD_A = "#EF7525" as MosaicColor;
const CHILD_B = "#2e86c1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<ChildMosaicProps>({
  childGrid: {
    type: "number",
    required: false,
    description: "The child document's grid (N×N). Raise it and watch the PARENT's m0 stay exactly the same length — that is the point.",
    meta: {
      constraints: { min: 2, max: 5 },
      control: { step: 1 },
      ui: { label: "Child grid" },
    },
  },
  declareChildSize: {
    type: "boolean",
    required: false,
    description: "Declare a square `size` on the child. A procedural child has no media to measure, so this is its ONLY aspect signal — without it the child renders at the parent tile's shape and its square cells stretch.",
    meta: { ui: { label: "Declare child size" } },
  },
});

export const ChildMosaicV1 = defineMosaicTemplate<ChildMosaicProps>({
  id: asTemplateId(ID),
  label: "38 · Child Mosaic",
  version: 1,
  description:
    "A complete document rendered inside one tile: children + a {type:\"mosaic\", ref} source, evaluated bottom-up. The child's grid grows while the parent's m0 stays two cells — and a procedural child keeps its aspect only if it declares its own size.",
  capabilities: { tier: "core" },
  tags: ["compose", "children", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Drag Child grid 2→5: the parent's m0 never changes. Then flip Declare child size.",
  },

  propsSchema,
  defaultProps: { childGrid: 3, declareChildSize: true },

  async render(
    props: ChildMosaicProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const childGrid = props.childGrid ?? 3;
    const declareChildSize = props.declareChildSize ?? true;

    if (!Number.isInteger(childGrid) || childGrid < 2 || childGrid > 5) {
      throw new Error(
        `${ID}: childGrid must be a whole number 2-5, got ${JSON.stringify(childGrid)}.`,
      );
    }

    const { width, height } = ctx.target;

    /* ── The child: a complete document of its own ─────────── */

    const ones = new Array(childGrid).fill(1);
    const row = String(
      weightedSplit(ones, "col", { claimants: new Array(childGrid).fill("1") }),
    );
    const childM0 = toM0String(
      String(weightedSplit(ones, "row", { claimants: new Array(childGrid).fill(row) })),
      `${ID}:child`,
    );

    // Checkerboard, so a stretched cell is obvious at a glance.
    const childSources: MosaicSource[] = [];
    for (let r = 0; r < childGrid; r++) {
      for (let c = 0; c < childGrid; c++) {
        childSources.push(makeColorTile((r + c) % 2 === 0 ? CHILD_A : CHILD_B));
      }
    }

    // A SQUARE declared size against a portrait-ish tile, so the difference
    // the flag makes is visible rather than theoretical.
    const childSquare = Math.min(width, height);
    const child: MosaicDocument = {
      kind: "mosaic_document",
      version: 1,
      m0: childM0,
      assets: {},
      backgroundColor: "#101418" as MosaicColor,
      ...(declareChildSize
        ? { size: { width: childSquare, height: childSquare } }
        : {}),
      sources: childSources,
    };

    /* ── The parent: two cells. Always two cells. ──────────── */

    const parentM0 = toM0String(
      String(weightedSplit([1, 1], "col", { claimants: ["1{1}", "1"] })),
      ID,
    );

    const caption =
      `parent m0 "${parentM0}" (${parentM0.length} chars, 2 cells) - ` +
      `child m0 "${childM0}" (${childGrid * childGrid} cells) - ` +
      (declareChildSize
        ? `child declares ${childSquare}x${childSquare}, so it keeps its square cells and letterboxes`
        : `child declares NO size, so it renders at the tile's shape and its cells stretch`);

    return {
      kind: "mosaic_document",
      version: 1,
      m0: parentM0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      children: { [CHILD_REF]: child },
      sources: [
        makeColorTile(PANEL),
        svgLabel(caption, Math.round(width / 2), height, {
          maxPx: Math.round(height * 0.032),
          maxLines: 8,
          color: INK_DIM,
        }),
        // The whole nested document, as one tile's content.
        { type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } } as MosaicSource,
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Child Mosaic",
    lines: [
      "children is a map of complete documents, and a {type:\"mosaic\", ref} source says \"this tile is that document\".",
      "Evaluation is bottom-up: each child renders into its own framebuffer first, and the parent treats the result as media.",
      "So the parent's m0 never grows - the DSL is shape, children is content. A finite framebuffer also CLIPS by construction.",
      "A procedural child has nothing to measure, so declare size or it inherits the parent tile's shape.",
    ],
    explore: [
      "Drag Child grid 2 to 5 - the parent's m0 never moves",
      "Flip Declare child size off: the square cells stretch",
      "Open the structure dock - the child is a document, one level in",
      "Switch the Device aspect and watch which mode keeps its squares",
    ],
  }),
});

export default ChildMosaicV1;
