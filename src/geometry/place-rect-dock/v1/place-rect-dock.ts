import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { placeRect, toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/place-rect-dock/v1` — one exact rectangle,
 * exactly where you said.
 *
 * ONE CONCEPT: `placeRect` places ONE pixel-exact rect inside a canvas —
 * x/y or alignment, exact width/height — and emits an m0 whose margins are
 * null tiles (they claim space and paint nothing, so nothing quantizes
 * INTO your rect). This is the tool for docking a logo, a badge, a
 * watermark: one rendered frame, everything else is air.
 *
 * The caveat that keeps it honest: placeRect is a HEAD-ONLY move. The
 * emitted string encodes THIS canvas's pixels (`rootW`/`rootH` are baked
 * into the split weights), so it belongs on the final, never-nested canvas.
 * Rerender at another size and this template re-bakes a different string —
 * the caption prints the numbers so you can watch it happen.
 */

export type PlaceRectDockProps = {
  /** Dock width as a fraction of canvas width (0.1-0.5). */
  widthFrac?: number;
  /** Dock height as a fraction of canvas height (0.06-0.4). */
  heightFrac?: number;
  /** Margin from the bottom-right corner, px (0-128). */
  marginPx?: number;
  /** Dock fill (#rrggbb). */
  dockColor?: string;
};

const ID = "@m0saic-starter/geometry/place-rect-dock/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<PlaceRectDockProps>({
  widthFrac: {
    type: "number",
    required: false,
    description: "Dock width as a fraction of canvas width (0.1-0.5).",
    meta: { constraints: { min: 0.1, max: 0.5 }, control: { step: 0.02 }, ui: { label: "Width" } },
  },
  heightFrac: {
    type: "number",
    required: false,
    description: "Dock height as a fraction of canvas height (0.06-0.4).",
    meta: { constraints: { min: 0.06, max: 0.4 }, control: { step: 0.02 }, ui: { label: "Height" } },
  },
  marginPx: {
    type: "number",
    required: false,
    description: "Margin from the bottom-right corner in pixels (0-128).",
    meta: { constraints: { min: 0, max: 128 }, control: { step: 1 }, ui: { label: "Margin" } },
  },
  dockColor: {
    type: "string",
    required: false,
    description: "Dock fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#b7950b" },
      ui: { label: "Dock color" },
    },
  },
});

export const PlaceRectDockV1 = defineMosaicTemplate<PlaceRectDockProps>({
  id: asTemplateId(ID),
  label: "PlaceRect Dock",
  version: 1,
  description:
    "Docks one pixel-exact rect in the bottom-right corner via placeRect: margins are null tiles, so nothing quantizes into your rect. Head-only by design — the emitted string bakes THIS canvas's pixels, and the caption prints them so you can watch it re-bake per size.",
  capabilities: { tier: "core" },
  tags: ["geometry", "placement", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Render at two widths and diff the saved m0 — the dock's numbers move, the design doesn't.",
  },

  propsSchema,
  defaultProps: { widthFrac: 0.24, heightFrac: 0.14, marginPx: 32, dockColor: "#b7950b" },

  async render(
    props: PlaceRectDockProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const widthFrac = props.widthFrac ?? 0.24;
    const heightFrac = props.heightFrac ?? 0.14;
    const marginPx = props.marginPx ?? 32;
    const dockColor = props.dockColor ?? "#b7950b";

    if (widthFrac < 0.1 || widthFrac > 0.5 || heightFrac < 0.06 || heightFrac > 0.4) {
      throw new Error(`${ID}: widthFrac 0.1-0.5 and heightFrac 0.06-0.4 required.`);
    }
    if (!Number.isInteger(marginPx) || marginPx < 0 || marginPx > 128) {
      throw new Error(`${ID}: marginPx must be an integer 0-128, got ${marginPx}.`);
    }
    if (!HEX.test(dockColor)) {
      throw new Error(`${ID}: dockColor ${JSON.stringify(dockColor)} must be #rrggbb.`);
    }

    const { width, height } = ctx.target;
    const rectW = Math.round(width * widthFrac);
    const rectH = Math.round(height * heightFrac);
    const x = Math.max(0, width - rectW - marginPx);
    const y = Math.max(0, height - rectH - marginPx);

    const placed = placeRect({ rootW: width, rootH: height, rectW, rectH, x, y });

    // The dock plus a caption overlay printing the baked pixels. The
    // caption's overlay is a plain row split whose only tile is the TOP
    // sixth — text stays tightly bound to its band instead of claiming the
    // whole canvas (which would cover the dock's rect in the editor).
    const m0 = toM0String(`${placed.m0}{6[1,-,-,-,-,-]}`, ID);

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(dockColor as MosaicColor),
        svgLabel(
          `placeRect ${rectW}x${rectH} at (${x},${y}) - exact px, baked for ${width}x${height}`,
          width,
          Math.round(height / 6),
          { maxPx: Math.round(height * 0.04), maxLines: 2 },
        ),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "PlaceRect Dock",
    lines: [
      "placeRect places ONE pixel-exact rect; its margins are null tiles, so nothing quantizes into your rect.",
      "Head-only by design: the emitted string bakes THIS canvas's pixels. For exact rects that must survive nesting, use inset recovery instead (previous lesson).",
    ],
    explore: [
      "Resize the canvas and watch the caption's numbers re-bake",
      "Move the dock with Width / Height / Margin",
    ],
  }),
});

export default PlaceRectDockV1;
