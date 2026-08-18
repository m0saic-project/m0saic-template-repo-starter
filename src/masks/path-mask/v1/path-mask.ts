import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSourceMask,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  MASK_SUBPATH_BUDGET,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/masks/path-mask/v1` — holes, drawing direction, and the
 * translucent body. The three things a hand-authored mask path can do that
 * a single shape can't.
 *
 * ONE CONCEPT: a mask's `localPath` is a full SVG path, so it can hold MANY
 * shapes — and when one sits inside another, what happens in the middle is
 * decided by the DIRECTION each one was drawn in, not by anything you get to
 * declare.
 *
 * A path is a pen stroke, and every loop goes round one way or the other.
 * To decide whether a spot is inside the shape or a hole, the renderer
 * stands on that spot and counts the loops wrapping around it: clockwise
 * counts +1, counter-clockwise counts −1. Total zero → hole. Anything else →
 * filled. (SVG calls this the NONZERO fill rule, and it is what the engine
 * gets: the mask rasterizes as `<path d="…" fill="white"/>` with no
 * `fill-rule` attribute, so the default applies.)
 *
 * So a donut is two circles drawn in OPPOSITE directions — the middle is
 * +1 from the outer and −1 from the inner, which cancels to zero. Draw them
 * the SAME way and the middle counts +2: not zero, so it fills in and you
 * have a disc. Nothing errors; you just don't get your hole.
 *
 * The thing to carry away: you never tell the renderer "put a hole here".
 * You tell it "draw this one backwards", and the hole is the consequence.
 * (Verified against the engine's own rasterizer rather than inferred:
 * opposite directions leave the centre transparent, matching directions
 * paint it solid.)
 *
 * `matte` is the other knob. By default everything outside the path is
 * clipped to nothing; `matte: 0..1` renders the whole `bounds` box at that
 * alpha UNDERNEATH the path, which stays fully opaque. One tile then carries
 * a translucent wash plus crisp opaque marks — how a wireframe draws a
 * filled rect with sharp borders in a single source.
 *
 * ⚠️ Check a matte in MOTION, not in a still: at the time of writing, a
 * single-frame render composites onto a transparent base and drops alpha at
 * encode time, so a partial matte arrives at full strength there while a
 * video render blends it correctly. The hole half of this lesson is
 * unaffected either way.
 *
 * The budget: paths carry up to MASK_SUBPATH_BUDGET (260) subpaths. Past
 * that, split the drawing across sources.
 */

export type PathMaskProps = {
  /** Which way round the inner circle is drawn — "opposite" is what makes the hole. */
  innerWinding?: "opposite" | "same";
  /** Alpha for the area OUTSIDE the path (0 = clipped, the default). */
  matte?: number;
  /** Ink for the tile the mask clips (#rrggbb). */
  inkColor?: string;
};

const ID = "@m0saic-starter/masks/path-mask/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const WINDINGS = ["opposite", "same"] as const;
const INK_DIM = "#7f8c9b" as MosaicColor;

/**
 * One circle as two half-arcs. `sweep` is the SVG arc sweep flag and it is
 * the whole lesson: 1 draws clockwise, 0 counter-clockwise.
 */
function circlePathD(cx: number, cy: number, r: number, sweep: 0 | 1): string {
  return (
    `M ${cx - r} ${cy} ` +
    `A ${r} ${r} 0 1 ${sweep} ${cx + r} ${cy} ` +
    `A ${r} ${r} 0 1 ${sweep} ${cx - r} ${cy} Z`
  );
}

const propsSchema = definePropsSchema<PathMaskProps>({
  innerWinding: {
    type: "string",
    required: false,
    description:
      "Which way round the inner circle is drawn. \"opposite\" = the other way from the outer circle, which is what punches the hole (the two directions cancel out in the middle). \"same\" = the same way round, and the middle fills in instead — a disc, with nothing to tell you why.",
    meta: {
      constraints: { oneOf: [...WINDINGS] },
      ui: { label: "Inner circle drawn" },
    },
  },
  matte: {
    type: "number",
    required: false,
    description: "Alpha for everything OUTSIDE the path (0 = clipped away, the default). Above 0 the whole bounds box renders at this alpha beneath the fully-opaque path — one tile, translucent wash plus crisp marks.",
    meta: {
      constraints: { min: 0, max: 1 },
      control: { step: 0.05 },
      ui: { label: "Matte alpha" },
    },
  },
  inkColor: {
    type: "string",
    required: false,
    description: "Ink for the tile the mask clips, as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Ink" },
    },
  },
});

export const PathMaskV1 = defineMosaicTemplate<PathMaskProps>({
  id: asTemplateId(ID),
  label: "37 · Path Mask",
  version: 1,
  description:
    "A donut, and the two rules behind it: a shape inside another cuts a hole only when it is DRAWN the other way round (the two directions cancel; draw them the same way and the middle fills in silently), and `matte` renders the area outside the path at a chosen alpha instead of clipping it away.",
  capabilities: { tier: "core" },
  tags: ["masks", "paths", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Flip Inner circle drawn to \"same\" — the hole fills in with no error at all.",
  },

  propsSchema,
  defaultProps: { innerWinding: "opposite", matte: 0, inkColor: "#2e86c1" },

  async render(
    props: PathMaskProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const innerWinding = props.innerWinding ?? "opposite";
    const matte = props.matte ?? 0;
    const inkColor = props.inkColor ?? "#2e86c1";

    const problems: string[] = [];
    if (!WINDINGS.includes(innerWinding as (typeof WINDINGS)[number])) {
      problems.push(
        `innerWinding must be one of ${WINDINGS.join(" | ")}, got ${JSON.stringify(innerWinding)}`,
      );
    }
    if (!Number.isFinite(matte) || matte < 0 || matte > 1) {
      problems.push(`matte is an alpha 0-1, got ${JSON.stringify(matte)}`);
    }
    if (!HEX.test(inkColor)) {
      problems.push(`inkColor ${JSON.stringify(inkColor)} must be #rrggbb`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    const cell = {
      width: Math.round((width * 2) / 4),
      height: Math.round((height * 5) / 6),
    };
    const cx = cell.width / 2;
    const cy = cell.height / 2;
    const outerR = Math.round(Math.min(cell.width, cell.height) * 0.42);
    const innerR = Math.round(outerR * 0.5);

    // Outer always clockwise. The inner subpath's sweep flag is the entire
    // difference between a ring and a disc.
    const localPath =
      circlePathD(cx, cy, outerR, 1) +
      " " +
      circlePathD(cx, cy, innerR, innerWinding === "opposite" ? 0 : 1);

    const mask: MosaicSourceMask = {
      kind: "inline-mask",
      localPath,
      bounds: { x: 0, y: 0, width: cell.width, height: cell.height },
      // Omit the field entirely at 0 — that IS the default, and a document
      // shouldn't carry knobs it isn't using.
      ...(matte > 0 ? { matte } : {}),
    };

    const caption =
      `2 circles in one path (budget ${MASK_SUBPATH_BUDGET}) - inner drawn the ${
        innerWinding === "opposite" ? "OTHER way round" : "SAME way round"
      }: ` +
      (innerWinding === "opposite"
        ? "the two directions cancel, so the middle is a HOLE"
        : "the directions add up, so the middle fills in - a ring that isn't") +
      (matte > 0 ? ` - matte ${matte}: the box outside the path renders at that alpha` : "");

    const m0 = toM0String(
      String(
        weightedSplit([5, 1], "row", {
          claimants: [
            String(weightedSplit([1, 2, 1], "col", { claimants: ["-", "1", "-"] })),
            "1",
          ],
        }),
      ),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(inkColor as MosaicColor, { mask }),
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.028),
          maxLines: 2,
          color: INK_DIM,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Path Mask",
    lines: [
      "A path is a pen stroke, and every loop goes round one way or the other.",
      "To decide if a spot is a hole, the renderer counts the loops around it: clockwise +1, counter-clockwise -1. Zero means hole.",
      "So a donut is two circles drawn OPPOSITE ways. Draw them the same way and the middle fills in - a disc, and nothing errors.",
      "matte is the other knob: instead of clipping the outside away, render it at an alpha under the opaque path.",
    ],
    explore: [
      "Flip Inner circle drawn to \"same\" - the hole fills in, silently",
      "Raise Matte alpha to 0.3 - the cell washes in, the ring stays solid",
      "Judge a matte in motion; a still shows it at full strength today",
      "Change the ink: the mask decides the shape, never the pixels",
    ],
  }),
});

export default PathMaskV1;
