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
 * `@m0saic-starter/geometry/overlay-stack/v1` — an overlay restores the
 * whole canvas and paints ON TOP.
 *
 * ONE CONCEPT: the attached `{...}` block. Attach an overlay to any node
 * and its content gets a FRESH copy of that node's rect to subdivide —
 * layered above, painted after. Three rules to internalize:
 *
 *   1. RESTORE: inside `1{3[-,1,-]}` the overlay's `3[-,1,-]` re-splits the
 *      full tile the `1` occupies — the base's geometry doesn't constrain
 *      the overlay's.
 *   2. PAINT ORDER: base first, then its overlay content — later paints
 *      above. Nesting continues the walk: this template's badge lives on an
 *      overlay INSIDE the band's overlay, so it paints above both.
 *   3. BINDING ORDER: sources[] still bind to rendered frames in walk
 *      order — base, band, badge — exactly the paint order.
 *
 * The string here is `1{3[-,1{1},-]}`: a full-canvas base, a centered
 * horizontal band on its overlay, and a badge on the band's own overlay.
 * Three frames, three sources, three layers of paint.
 */

export type OverlayStackProps = {
  /** Base fill (#rrggbb). */
  baseColor?: string;
  /** Band fill (#rrggbb). */
  bandColor?: string;
};

const ID = "@m0saic-starter/geometry/overlay-stack/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<OverlayStackProps>({
  baseColor: {
    type: "string",
    required: false,
    description: "Base (bottom layer) fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#154360" },
      ui: { label: "Base color" },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Band (middle layer) fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color" },
    },
  },
});

export const OverlayStackV1 = defineMosaicTemplate<OverlayStackProps>({
  id: asTemplateId(ID),
  label: "07 · Overlay Stack",
  version: 1,
  description:
    "1{3[-,1{1},-]}: a full-canvas base, a centered band on its overlay, a badge on the band's overlay. Overlays restore their node's whole rect and paint after it — walk order IS paint order IS source-binding order.",
  capabilities: { tier: "core" },
  tags: ["geometry", "overlay", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Three layers of paint from three frames — read the string alongside the render.",
  },

  propsSchema,
  defaultProps: { baseColor: "#154360", bandColor: "#2e86c1" },

  async render(
    props: OverlayStackProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const baseColor = props.baseColor ?? "#154360";
    const bandColor = props.bandColor ?? "#2e86c1";
    for (const [key, value] of [
      ["baseColor", baseColor],
      ["bandColor", bandColor],
    ] as const) {
      if (!HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }

    const { width, height } = ctx.target;
    // base -> its overlay band (middle third of the canvas) -> the band's
    // own overlay badge. Every `{...}` restores its node's full rect.
    const m0 = toM0String("1{3[-,1{1},-]}", ID);

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources: [
        makeColorTile(baseColor as MosaicColor),
        makeColorTile(bandColor as MosaicColor),
        svgLabel("badge: painted last, above everything", width, height / 3, {
          maxPx: Math.round(height * 0.05),
          maxLines: 2,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Overlay Stack",
    lines: [
      "Attach {...} to any node and its content re-splits that node's FULL rect - layered above, painted after.",
      "Walk order is paint order is source-binding order: base, then band, then badge.",
      "The whole card is one string: 1{3[-,1{1},-]}.",
    ],
    explore: [
      "Geometry view: step the layer filter through depths",
      "Change the two colors - base and band bind in walk order",
    ],
  }),
});

export default OverlayStackV1;
