import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/mask-in-a-cell/v1` — shapes are masked COLOR
 * TILES in ratio cells, and the mask's bounds are a design space.
 *
 * ONE CONCEPT: a non-rectangular shape is not a special source — it's an
 * ordinary color tile with an inline SVG-path mask, living in an ordinary
 * ratio cell. The engine scales the mask's `bounds` box onto the cell:
 *
 *   scaleX = cellWidth / bounds.width;  scaleY = cellHeight / bounds.height
 *
 * The axes scale INDEPENDENTLY — and that's the silent failure mode this
 * template makes visible: author a shape against square bounds, drop it in
 * a non-square cell, and it smears. No error, no warning, just a stretched
 * shape. The fix is to make the BOUNDS match the CELL's aspect (compute the
 * cell box from ctx.target + your own weights, then draw the path inside
 * bounds of that shape). Flip `matchAspect` to see both.
 *
 * This is the launder-ladder rung that replaces "mask the whole canvas":
 * masks are leaf-private (fiber) — the cell's geometry stays a cheap ratio
 * split, and the shape costs zero DSL.
 */

export type MaskInACellProps = {
  /** true: bounds match the cell's aspect (correct). false: square bounds in a non-square cell (the smear). */
  matchAspect?: boolean;
  /** Shape fill (#rrggbb). */
  shapeColor?: string;
};

const ID = "@m0saic-starter/geometry/mask-in-a-cell/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<MaskInACellProps>({
  matchAspect: {
    type: "boolean",
    required: false,
    description:
      "true: mask bounds match the cell aspect (diamond stays a diamond). false: square bounds stretched over the cell — the silent smear this lesson exists to show.",
    meta: { ui: { label: "Match cell aspect" } },
  },
  shapeColor: {
    type: "string",
    required: false,
    description: "Shape fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#c0392b" },
      ui: { label: "Shape color" },
    },
  },
});

export const MaskInACellV1 = defineMosaicTemplate<MaskInACellProps>({
  id: asTemplateId(ID),
  label: "12 · Mask in a Cell",
  version: 1,
  description:
    "A diamond as it should be built: a color tile with an inline SVG-path mask inside a plain ratio cell. Bounds scale onto the cell PER AXIS — match their aspect to the cell or the shape silently smears. Flip the toggle to see both.",
  capabilities: { tier: "core" },
  tags: ["geometry", "masks", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Flip Match cell aspect off and re-render — same string, smeared shape.",
  },

  propsSchema,
  defaultProps: { matchAspect: true, shapeColor: "#c0392b" },

  async render(
    props: MaskInACellProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const matchAspect = props.matchAspect ?? true;
    const shapeColor = props.shapeColor ?? "#c0392b";
    if (!HEX.test(shapeColor)) {
      throw new Error(`${ID}: shapeColor ${JSON.stringify(shapeColor)} must be #rrggbb.`);
    }

    const { width, height } = ctx.target;
    // The shape's cell: the center third of a 1:1:1 column split.
    const cellW = Math.round(width / 3);
    const cellH = height;

    // The DESIGN SPACE. Correct mode: bounds shaped like the cell, with the
    // diamond drawn regular inside them (its own aspect preserved by using
    // the short side). Smear mode: square bounds — the engine stretches
    // them onto the non-square cell and the diamond distorts with them.
    const bounds = matchAspect
      ? { x: 0, y: 0, width: cellW, height: cellH }
      : { x: 0, y: 0, width: 100, height: 100 };

    const cx = bounds.width / 2;
    const cy = bounds.height / 2;
    const r = matchAspect ? Math.min(cellW, cellH) * 0.42 : 50;
    const localPath = `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;

    // Caption bound to the BOTTOM sixth via a plain row-split overlay —
    // full-canvas text would cover the diamond's cell in the editor.
    const m0 = toM0String("3(-,1,-){6[-,-,-,-,-,1]}", ID);

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(shapeColor as MosaicColor, {
          mask: { kind: "inline-mask", localPath, bounds },
        }),
        svgLabel(
          matchAspect
            ? `bounds ${bounds.width}x${bounds.height} match the ${cellW}x${cellH} cell - true diamond`
            : `square bounds stretched onto a ${cellW}x${cellH} cell - the silent smear`,
          width,
          Math.round(height / 6),
          { maxPx: Math.round(height * 0.04), maxLines: 2 },
        ),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Mask in a Cell",
    lines: [
      "A shape is an ordinary color tile with an inline SVG-path mask, living in an ordinary ratio cell - shapes cost zero DSL.",
      "Mask bounds scale onto the cell PER AXIS: author against square bounds, drop into a non-square cell, and the shape silently smears. No error, no warning.",
      "The fix: make the bounds match the cell's aspect, computed from ctx.target and your own split weights.",
    ],
    explore: [
      "Toggle Match cell aspect off - same string, smeared diamond",
      "Switch the Device aspect and re-check both modes",
    ],
  }),
});

export default MaskInACellV1;
