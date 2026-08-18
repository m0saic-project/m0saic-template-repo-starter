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
  makeErrorMosaic,
  parseRegionsValue,
  resolveRegionsToPx,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/draw-regions/v1` — the user marks an area on
 * the LIVE PREVIEW, and the template receives geometry.
 *
 * ONE CONCEPT: `picker: "regions"`. The handshake is the product: a
 * template declares that it wants AREAS, and the preferred UX for handing
 * over geometry is drawing against the live preview — the user interacts
 * with the picture naturally, marking the thing they mean. The wire is a
 * plain `MosaicRegionsValue` (`{ canvas?, regions: [{x, y, w, h}, …] }`,
 * integer px in the authored canvas), so the same value also arrives from
 * `--props` JSON, an agent, or a saved file.
 *
 * WHAT THE TEMPLATE DOES WITH THE AREAS IS ITS OWN CONCERN. The production
 * first-adopter blurs them; a redaction template would black them out; an
 * AI-driven template would treat them as target bounding boxes for its own
 * work. This class of templates — local, visual user feedback flowing into
 * arbitrary downstream behavior — is exactly what the regions contract
 * exists to enable. This lesson keeps its concern honest and minimal: it
 * SHOWS the handshake, marking each received region on a stand-in scene
 * with an index chip, in the order the user drew them (order is intent and
 * is preserved on the wire).
 *
 * Consumption discipline, straight from the contract:
 *  - `parseRegionsValue` at the boundary (tolerant: wrapper object, bare
 *    array, JSON string, numeric strings — all legal arrivals);
 *  - `resolveRegionsToPx` against YOUR target canvas (rescales
 *    authored-canvas coordinates, clamps, per-region verdicts — degrade a
 *    bad region, keep the batch);
 *  - ZERO regions is the working BASE CASE, not an error — the scene
 *    renders with an invitation to draw.
 *
 * Geometry note: resolved px land on a quarter-resolution grid before
 * `placeRects`, deliberately — full-px placement would bake the render
 * width into the precision floor (the design-pixels trap from the
 * options/floors lessons); /4 keeps the safe minimum a quarter of it.
 */

export type DrawRegionsProps = {
  /** The marked areas — drawn on the preview, or hand-authored JSON. */
  regions?: unknown;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/draw-regions/v1";
const MAX_REGIONS = 6;

/** Region chip palette — index-stable so re-renders keep their colors. */
const CHIPS: ReadonlyArray<MosaicColor> = [
  "#2e86c1" as MosaicColor,
  "#27ae60" as MosaicColor,
  "#ca6f1e" as MosaicColor,
  "#884ea0" as MosaicColor,
  "#c0392b" as MosaicColor,
  "#17a589" as MosaicColor,
];

/** Default marked areas — two rects over the stand-in scene. */
export const DEFAULT_REGIONS = {
  canvas: { w: 1280, h: 720 },
  regions: [
    { x: 96, y: 128, w: 288, h: 288 },
    { x: 800, y: 96, w: 384, h: 192 },
  ],
};

const propsSchema = definePropsSchema<DrawRegionsProps>({
  regions: {
    type: "json",
    required: false,
    description:
      "The areas you marked. Draw on the preview (rect tool; ellipse and brush carve masks inside a rect), or hand-author { canvas, regions: [{x,y,w,h}] } px JSON — the wire is the same either way, and order is your intent.",
    meta: {
      control: {
        picker: "regions",
        regions: {
          min: 0,
          max: MAX_REGIONS,
          shapes: ["rect", "ellipse", "brush"],
        },
      },
      ui: { label: "Marked areas", order: 1 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 2 },
    },
  },
});

export const DrawRegionsV1 = defineMosaicTemplate<DrawRegionsProps>({
  id: asTemplateId(ID),
  label: "25 · Draw Regions",
  version: 1,
  description:
    "The user marks an area on the live preview and the template receives geometry — that handshake is the product. picker \"regions\" arms Make's draw mode (rect tool, plus ellipse/brush mask carving inside a rect); the wire is plain px JSON, so the same value arrives from --props or an agent identically. What a template does with the areas is its own concern — blur them, redact them, hand them to AI work as target boxes; this lesson shows the handshake itself, marking each region with an index chip in draw order. Zero regions is the working base case, and consumption runs parseRegionsValue then resolveRegionsToPx, degrading bad regions without killing the batch.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Open Marked areas and draw on the preview — rectangles land as numbered chips in draw order. Delete them all: the scene invites you again.",
  },

  propsSchema,
  defaultProps: {
    regions: DEFAULT_REGIONS,
    pageColor: "#1c2833",
  },

  async render(
    props: DrawRegionsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // Boundary: tolerant parse; a malformed value gets a report card that
    // names the wire shape, never a dead preview.
    const parsed = parseRegionsValue(props.regions ?? DEFAULT_REGIONS);
    if (!parsed.ok) {
      return makeErrorMosaic(
        [
          `- the regions prop did not parse: ${parsed.error}`,
          `- the wire is { canvas?, regions: [{x, y, w, h}, ...] } in integer px`,
          `- draw on the preview instead of hand-typing, and the shape is always right`,
        ].join("\n"),
        { width, height, title: "Marked areas do not parse", errorCode: "STARTER_BAD_REGIONS" },
      );
    }
    // Semantics: rescale to THIS canvas, clamp, judge per region.
    const resolved = resolveRegionsToPx(parsed, { width, height });
    const rects = resolved
      .filter((r): r is typeof r & { ok: true } => r.ok === true)
      .slice(0, MAX_REGIONS);
    const dropped = resolved.length - rects.length;

    // The stand-in scene: sky / ridge / ground bands — something to draw
    // OVER, so marking "the subject" feels natural.
    const scene = String(weightedSplit([46, 22, 32], "row", {
      mode: "literal",
      claimants: ["1", "1", "1"],
    }));

    // Quarter-resolution grid keeps the precision floor at width/4 instead
    // of width (the design-pixels trap). One placeRects layer per region,
    // nested innermost-last, so source order equals DRAW order.
    const gw = Math.max(8, Math.ceil(width / 4));
    const gh = Math.max(8, Math.ceil(height / 4));
    const grid = (v: number, scaleFrom: number, max: number) =>
      Math.min(max, Math.max(0, Math.round((v / scaleFrom) * max)));
    // Fold layers innermost-out with the caption strip at the very center —
    // overlay CHAINS are illegal, nesting is not, and string order (layer 0
    // outermost) is what keeps source binding in DRAW order.
    let chain = "6[-,-,-,-,-,1]";
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      const x = grid(r.x, width, gw - 2);
      const y = grid(r.y, height, gh - 2);
      const rect = {
        x,
        y,
        w: Math.min(gw - x, Math.max(2, grid(r.w, width, gw))),
        h: Math.min(gh - y, Math.max(2, grid(r.h, height, gh))),
        claimant: "1{1}",
      };
      const layer = String(placeRects({ rootW: gw, rootH: gh, rects: [rect] }).layers[0].m0);
      chain = `${layer}{${chain}}`;
    }
    const m0 = toM0String(`${scene}{${chain}}`, ID);

    const sources: MosaicSource[] = [];
    sources.push(makeColorTile("#22303e" as MosaicColor)); // sky
    sources.push(makeColorTile("#1a252f" as MosaicColor)); // ridge
    sources.push(makeColorTile("#141d26" as MosaicColor)); // ground
    for (const [i, r] of rects.entries()) {
      sources.push(makeColorTile(CHIPS[i % CHIPS.length]));
      sources.push(
        svgLabel(`${i + 1}  ${r.w}x${r.h}`, Math.max(60, r.w * 0.9), Math.max(30, r.h * 0.5), {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round(height * 0.03),
          vAlign: "middle",
        }),
      );
    }

    const heading = fitSvgText(
      rects.length === 0
        ? "DRAW REGIONS - the scene is waiting; mark an area on the preview"
        : `DRAW REGIONS - ${rects.length} area${rects.length === 1 ? "" : "s"} received, in draw order${dropped > 0 ? ` (${dropped} degraded)` : ""}`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "the handshake is the product: you mark geometry against the live preview; the wire is plain px JSON either way",
        "what a template DOES with areas is its own concern - blur, redact, AI target boxes; this one just shows receipt",
      ],
      width * 0.9,
      height * 0.09,
      { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
    );
    sources.push(
      svgTextSource([
        {
          text: heading.text,
          fontSize: heading.fontSize,
          color: "#eaeef2" as MosaicColor,
          vAlign: "top",
          padding: { top: 0.08 },
        },
        {
          text: readout.text,
          fontSize: readout.fontSize,
          color: "#7f8c9b" as MosaicColor,
          vAlign: "bottom",
          padding: { bottom: 0.12 },
        },
      ]),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: page,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Draw Regions",
    lines: [
      "picker regions arms draw mode on the LIVE preview - the user marks areas naturally, and the template receives plain px JSON geometry.",
      "What you do with the areas is your concern: blur them, redact them, hand them to AI work as target boxes. The handshake is the product.",
      "Consume with parseRegionsValue then resolveRegionsToPx: tolerant at the boundary, per-region verdicts, zero regions as the base case.",
    ],
    explore: [
      "Draw two rects on the preview - chips land in draw order",
      "Delete them all - zero is a working state, not an error",
    ],
  }),
});

export default DrawRegionsV1;
