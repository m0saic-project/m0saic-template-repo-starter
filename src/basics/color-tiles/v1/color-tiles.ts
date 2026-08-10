import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

/**
 * `@m0saic-starter/basics/color-tiles/v1` — tiles, sources, and the canvas.
 *
 * ONE CONCEPT: how `sources[]` maps onto the m0 layout, plus the two
 * conventions every multi-tile template uses —
 *
 *   - `makeColorTile(color)` is THE way to paint a solid tile. It emits an
 *     ffmpeg `color=` (lavfi) source: essentially free to render, and it
 *     composes with masks/placement/overlay timing without special cases.
 *   - `document.backgroundColor` fills empty canvas. Never burn a "base
 *     layer" tile just to get a background — the document field is cheaper,
 *     and preview and render agree on it.
 *
 * The m0 comes from `weightedSplit([1, 1, 1], "col")` → `3(1,1,1)`: three
 * equal columns. Rendered frames appear in paint order, and `sources[i]`
 * fills frame i — first weight, first source.
 */

export type ColorTilesProps = {
  /** Tile fills, left to right (#rrggbb each). Determines the column count. */
  colors?: string[];
  /** Empty-canvas fill behind everything (#rrggbb). */
  backgroundColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/basics/color-tiles/v1";

const propsSchema = definePropsSchema<ColorTilesProps>({
  colors: {
    type: "string[]",
    required: false,
    description: "Tile fills, left to right (#rrggbb each). 2-8 columns.",
    // A string[] with color meta is a color LIST: the app renders one
    // swatch row per entry (add/remove; empty list = unset → defaults).
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true },
      ui: { label: "Tile colors" },
    },
  },
  backgroundColor: {
    type: "string",
    required: false,
    description: "Document background fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#0b0e11" },
      ui: { label: "Background" },
    },
  },
});

export const ColorTilesV1 = defineMosaicTemplate<ColorTilesProps>({
  id: asTemplateId(ID),
  label: "Color Tiles",
  version: 1,
  description:
    "Three equal columns, one makeColorTile each — the sources[]-to-tiles mapping, the lavfi color-tile convention, and document.backgroundColor instead of a wasted base layer.",
  capabilities: { tier: "core" },
  tags: ["basics", "layout", "color"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Static tiles — any canvas and duration render cleanly.",
  },

  propsSchema,
  defaultProps: {
    colors: ["#c0392b", "#1e8449", "#2471a3"],
    backgroundColor: "#0b0e11",
  },

  async render(
    props: ColorTilesProps,
    _ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const colors = props.colors ?? ["#c0392b", "#1e8449", "#2471a3"];
    const backgroundColor = props.backgroundColor ?? "#0b0e11";

    if (colors.length < 2 || colors.length > 8) {
      throw new Error(`${ID}: colors needs 2-8 entries, got ${colors.length}.`);
    }
    for (const c of [...colors, backgroundColor]) {
      if (!HEX.test(c)) {
        throw new Error(`${ID}: ${JSON.stringify(c)} must be a #rrggbb hex color.`);
      }
    }

    // One weight per color → one column per color → one source per column.
    const m0 = weightedSplit(colors.map(() => 1), "col");
    const sources: MosaicSource[] = colors.map((c) =>
      makeColorTile(c as MosaicColor),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: backgroundColor as MosaicColor,
      sources,
    };
  },
});

export default ColorTilesV1;
