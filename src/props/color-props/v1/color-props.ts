import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
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
 * `@m0saic-starter/props/color-props/v1` — the two color controls, declared
 * right.
 *
 * ONE CONCEPT: color props DECLARE THEMSELVES. A bare `type: "string"` prop
 * renders as a text field; add `constraints.isColor` + `control.colorPicker`
 * and the sidebar shows a real swatch. The same declaration on a
 * `type: "string[]"` prop gets the color-LIST control — one swatch row per
 * entry, add/remove/reorder. (This repo's conventions test enforces the
 * declaration on every color-typed prop, scalar or list.)
 *
 *   - `panelColor` (scalar)   → the big panel.
 *   - `palette`    (string[]) → the swatch column, one band per entry.
 */

export type ColorPropsProps = {
  /** The big panel's fill (#rrggbb). */
  panelColor?: string;
  /** The swatch column (1-8 entries, #rrggbb each). */
  palette?: string[];
};

const ID = "@m0saic-starter/props/color-props/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_PALETTE = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db"];

const propsSchema = definePropsSchema<ColorPropsProps>({
  panelColor: {
    type: "string",
    required: false,
    description: "The big panel's fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#21618c" },
      ui: { label: "Panel" },
    },
  },
  palette: {
    type: "string[]",
    required: false,
    description: "The swatch column as #rrggbb entries (1-8).",
    meta: {
      constraints: { isColor: true, minItems: 1, maxItems: 8 },
      control: { colorPicker: true },
      ui: { label: "Palette" },
    },
  },
});

export const ColorPropsV1 = defineMosaicTemplate<ColorPropsProps>({
  id: asTemplateId(ID),
  label: "16 · Color Props",
  version: 1,
  description:
    "Color props declare themselves: isColor + colorPicker turns a string prop into a real swatch control, and the same declaration on a string[] prop gets the color-list control. A scalar panel beside a palette column, receipts on the caption.",
  capabilities: { tier: "core" },
  tags: ["props", "color", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Open both controls in the sidebar — a swatch for the scalar, swatch ROWS for the list.",
  },

  propsSchema,
  defaultProps: { panelColor: "#21618c", palette: DEFAULT_PALETTE },

  async render(
    props: ColorPropsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const panelColor = props.panelColor ?? "#21618c";
    const palette = props.palette ?? DEFAULT_PALETTE;

    if (!HEX.test(panelColor)) {
      throw new Error(`${ID}: panelColor ${JSON.stringify(panelColor)} must be #rrggbb.`);
    }
    if (!Array.isArray(palette) || palette.length < 1 || palette.length > 8) {
      throw new Error(`${ID}: palette must hold 1-8 colors, got ${JSON.stringify(palette)}.`);
    }
    for (const c of palette) {
      if (typeof c !== "string" || !HEX.test(c)) {
        throw new Error(`${ID}: palette entry ${JSON.stringify(c)} must be #rrggbb.`);
      }
    }

    const { width, height } = ctx.target;

    // Panel (2/3) beside the palette column (1/3), caption band below.
    // Grammar: 1-count splits are illegal — one swatch IS the column.
    const column =
      palette.length === 1
        ? "1"
        : `${palette.length}[${new Array<string>(palette.length).fill("1").join(",")}]`;
    const mainRow = String(
      weightedSplit([2, 1], "col", { claimants: ["1", column] }),
    );
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [mainRow, "1"] })),
      ID,
    );

    const caption = `scalar panel ${panelColor} - list of ${palette.length}: ${palette.join(" ")}`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(panelColor as MosaicColor),
        ...palette.map((c) => makeColorTile(c as MosaicColor)),
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.026),
          maxLines: 2,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Color Props",
    lines: [
      "A color prop is a string that DECLARES itself: constraints.isColor plus control.colorPicker.",
      "Without the declaration you get a bare text field; with it, a real swatch - and on a string[] prop, a swatch list.",
      "A conventions test enforces it here, because undeclared color props are the #1 cause of clunky forms.",
    ],
    explore: [
      "Open Panel in the sidebar - a single swatch control",
      "Open Palette - add a fifth color and the column resplits",
      "The caption prints every value render() received",
    ],
  }),
});

export default ColorPropsV1;
