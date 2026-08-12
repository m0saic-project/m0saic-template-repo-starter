import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { placeRects, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/ratio-vs-absolute/v1` — a proportion contract
 * over a pixel contract, and you can WATCH them disagree.
 *
 * ONE CONCEPT: RATIO vs ABSOLUTE drafting.
 *
 *   - RATIO (`weightedSplit([1,2,1])`): the string carries PROPORTIONS.
 *     The sides are "a quarter of the canvas" — whatever the canvas is.
 *     Resize and they scale. Nest it in a parent slot and it recomposes.
 *   - ABSOLUTE (`placeRects` at exact pixels): the string carries PIXELS.
 *     The rails below are pinned at `railPx` no matter how wide the canvas
 *     gets — the middle absorbs every extra pixel. That's desktop-chrome
 *     drafting (fixed sidebars, fluid content). The cost: a px-baked
 *     string is only meaningful AT the canvas it was baked for; nested
 *     into a differently-sized slot it quietly degrades. Default to
 *     ratio; pin pixels only at the HEAD (the final, never-nested canvas).
 *
 * The two bands share a canvas so the disagreement is visible: drag the
 * canvas width and the top boundaries MOVE while the bottom rails HOLD.
 * One collision worth knowing: at exactly 4× the rail width a quarter IS
 * the rail (e.g. 960 wide at 240px rails) — both spellings canonicalize
 * to the SAME string. That collision is the lesson in one move: ratio
 * says "a quarter", absolute says "240px", and only sometimes do they
 * mean the same thing.
 */

export type RatioVsAbsoluteProps = {
  /** Pinned width of the absolute band's side rails, in px. */
  railPx?: number;
  /** Fill for the bottom (absolute) band's middle rect (#rrggbb). */
  absoluteColor?: string;
};

const ID = "@m0saic-starter/geometry/ratio-vs-absolute/v1";
const RATIO_FILLS = ["#1a5276", "#2471a3", "#1a5276"] as MosaicColor[];
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<RatioVsAbsoluteProps>({
  railPx: {
    type: "number",
    required: false,
    description:
      "Pinned width of the absolute band's side rails in px (40-1000). The ratio band ignores it — that's the point.",
    meta: { constraints: { min: 40, max: 1000 }, control: { step: 20 }, ui: { label: "Rail px" } },
  },
  absoluteColor: {
    type: "string",
    required: false,
    description: "Fill for the bottom (absolute) band's middle rect as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#117864" },
      ui: { label: "Absolute fill" },
    },
  },
});

export const RatioVsAbsoluteV1 = defineMosaicTemplate<RatioVsAbsoluteProps>({
  id: asTemplateId(ID),
  label: "06 · Ratio vs Absolute",
  version: 1,
  description:
    "A proportion contract over a pixel contract: a 1:2:1 ratio split whose sides scale with the canvas, above a placeRects band whose side rails are PINNED in px while the middle absorbs the rest. Resize the canvas and watch them disagree. Default to ratio; pin pixels only at the head canvas.",
  capabilities: { tier: "core" },
  tags: ["geometry", "drafting-modes", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Render at several widths: the ratio band's string never changes; the absolute band re-bakes its pixels every time.",
  },

  propsSchema,
  defaultProps: { railPx: 240, absoluteColor: "#117864" },

  async render(
    props: RatioVsAbsoluteProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const railPx = props.railPx ?? 240;
    const absoluteColor = props.absoluteColor ?? "#117864";
    if (!Number.isInteger(railPx) || railPx < 40 || railPx > 1000) {
      throw new Error(
        `${ID}: railPx must be an integer 40-1000, got ${JSON.stringify(railPx)}.`,
      );
    }
    if (!HEX.test(absoluteColor)) {
      throw new Error(`${ID}: absoluteColor ${JSON.stringify(absoluteColor)} must be #rrggbb.`);
    }

    const { width, height } = ctx.target;
    const halfH = Math.floor(height / 2);

    // RATIO band: proportions only. This exact string works at ANY canvas.
    const ratio = weightedSplit([1, 2, 1], "col");

    // ABSOLUTE band: rails pinned in px, middle takes the remainder. The
    // pin has a feasibility edge — two rails can't exceed the canvas — so
    // narrow canvases clamp the rail and the caption says so (a silent
    // clamp would be a lie about the very thing this lesson teaches).
    const railEff = Math.min(railPx, Math.floor(width * 0.3));
    const clamped = railEff !== railPx;
    const absolute = placeRects({
      rootW: width,
      rootH: halfH,
      rects: [
        { x: 0, y: 0, w: railEff, h: halfH },
        { x: railEff, y: 0, w: width - 2 * railEff, h: halfH },
        { x: width - railEff, y: 0, w: railEff, h: halfH },
      ],
    });

    // Stack the two bands; labels ride the attached overlay.
    const m0 = toM0String(`2[${ratio},${absolute.m0}]{2[1,1]}`, ID);

    const ratioSources: MosaicSource[] = RATIO_FILLS.map((fill) => makeColorTile(fill));
    // Non-overlapping rects pack onto one layer and walk left-to-right, so
    // the middle rect carries the caller's accent while the rails stay muted.
    const orderedRects = absolute.layers.flatMap((layer) => layer.rectIndices);
    const absoluteSources: MosaicSource[] = orderedRects.map((rectIndex) =>
      makeColorTile(
        rectIndex === 1 ? (absoluteColor as MosaicColor) : ("#0e6251" as MosaicColor),
      ),
    );

    const label = (text: string): MosaicSource =>
      svgLabel(text, width, halfH, {
        maxPx: Math.round(height * 0.04),
        vAlign: "bottom",
        padding: { bottom: 0.08 },
      });

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        ...ratioSources,
        ...absoluteSources,
        label(`ratio 1:2:1 - sides scale with the canvas: ~${Math.round(width / 4)}px here`),
        label(
          `placeRects - rails PINNED at ${railEff}px` +
            (clamped ? ` (clamped from ${railPx})` : "") +
            `, middle absorbs ${width - 2 * railEff}px`,
        ),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Ratio vs Absolute",
    lines: [
      "RATIO (weightedSplit) is a PROPORTION contract: the sides are a quarter of ANY canvas, and they recompose when nested.",
      "ABSOLUTE (placeRects) is a PIXEL contract: the rails stay railPx wide and the middle absorbs the rest - fixed sidebar, fluid content.",
      "A px-baked string only means something at the canvas it was baked for. Default to ratio; go absolute only at the head.",
    ],
    explore: [
      "Drag the canvas width: top boundaries move, bottom rails hold",
      "Watch the m0 readout - only the absolute band re-bakes",
      "Set 960 wide at Rail px 240 - both bands collapse into one",
      "Push Rail px past 30% and the caption reports the clamp",
    ],
  }),
});

export default RatioVsAbsoluteV1;
