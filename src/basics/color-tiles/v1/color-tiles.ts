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

import { lessonTutorial } from "../../../_shared/tutorial";

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
 * The m0 comes from `weightedSplit`. With `gap` at 0 that's
 * `weightedSplit([1,1,1], "col")` → `3(1,1,1)`: three equal columns, edge
 * to edge. Raise `gap` and NULL cells (`-`) are woven between and around
 * them — a null claims space and paints nothing, so what shows through is
 * the document background. That's the only way to SEE the second
 * convention: a canvas covered by tiles has no empty canvas left.
 *
 * Rendered frames appear in paint order and `sources[i]` fills frame i —
 * but nulls are not frames, so the source list stays exactly one entry per
 * color no matter how wide the gaps get.
 */

export type ColorTilesProps = {
  /** Tile fills, left to right (#rrggbb each). Determines the column count. */
  colors?: string[];
  /** Empty-canvas fill behind everything (#rrggbb). */
  backgroundColor?: string;
  /** Null-cell gap woven around the tiles, in weight units (0 = edge to edge). */
  gap?: number;
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
  gap: {
    type: "number",
    required: false,
    description:
      "Gap around and between the tiles, in weight units against a tile's 10 (0-6). The gaps are NULL cells — they paint nothing, so the document background shows through them. Set 0 for edge-to-edge tiles and the background disappears entirely.",
    meta: { constraints: { min: 0, max: 6 }, control: { step: 1 }, ui: { label: "Gap" } },
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
    gap: 1,
  },

  async render(
    props: ColorTilesProps,
    _ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const colors = props.colors ?? ["#c0392b", "#1e8449", "#2471a3"];
    const backgroundColor = props.backgroundColor ?? "#0b0e11";
    const gap = props.gap ?? 1;

    if (!Number.isInteger(gap) || gap < 0 || gap > 6) {
      throw new Error(`${ID}: gap must be an integer 0-6, got ${JSON.stringify(gap)}.`);
    }
    if (colors.length < 2 || colors.length > 8) {
      throw new Error(`${ID}: colors needs 2-8 entries, got ${colors.length}.`);
    }
    for (const c of [...colors, backgroundColor]) {
      if (!HEX.test(c)) {
        throw new Error(`${ID}: ${JSON.stringify(c)} must be a #rrggbb hex color.`);
      }
    }

    // One weight per color → one column per color → one source per column.
    // With a gap, null cells (`-`) are woven around and between the tiles:
    // they claim width and paint nothing, so the document background shows
    // there — and they claim NO source, so `sources` still holds exactly
    // one entry per color.
    const TILE_WEIGHT = 10;
    const m0 =
      gap === 0
        ? weightedSplit(colors.map(() => TILE_WEIGHT), "col")
        : (() => {
            // Columns with a null on each side and between each pair…
            const weights: number[] = [gap];
            const claimants: string[] = ["-"];
            for (const _ of colors) {
              weights.push(TILE_WEIGHT, gap);
              claimants.push("1", "-");
            }
            const row = String(weightedSplit(weights, "col", { claimants }));
            // …then a null band above and below, so the background frames
            // the tiles on all four sides instead of showing as slits.
            return weightedSplit([gap, TILE_WEIGHT, gap], "row", {
              claimants: ["-", row, "-"],
            });
          })();
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

  renderTutorial: lessonTutorial({
    title: "Color Tiles",
    lines: [
      "sources[] maps onto rendered tiles in walk order: first weight, first source.",
      "Solid tiles are makeColorTile - a free lavfi color source that composes with masks, placement, and per-tile timing.",
      "Empty canvas shows document.backgroundColor: never burn a base layer just to get a background. The Gap knob is what leaves any canvas empty - it weaves NULL cells around the tiles, and a null paints nothing, so the background shows through it.",
      "Nulls claim space but never claim a source: widen the gap all you like and sources stays one entry per color.",
    ],
    explore: [
      "Set Gap to 0 - the tiles go edge to edge and the Background knob stops mattering",
      "Widen Gap, then change Background - THAT is the document fill",
      "Add a 4th color - the split follows the array",
      "Eye menu > Show dimensions for per-tile pixels",
    ],
  }),
});

export default ColorTilesV1;
