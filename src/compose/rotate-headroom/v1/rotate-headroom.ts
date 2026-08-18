import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  placeInsetPieces,
  solidBackground,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/compose/rotate-headroom/v1` — `effects.rotate` spins the
 * content INSIDE the tile, and the tile never grows. Headroom has to be real
 * geometry.
 *
 * ONE CONCEPT: rotation is in-place. The engine emits
 * `rotate=a=…:ow=iw:oh=ih`, so the buffer keeps its exact size: uncovered
 * corners fill transparent, and content corners that leave the buffer are
 * CLIPPED. That is deliberate — a tile that could bleed past its cell would
 * break every downstream placement calculation.
 *
 * Which means the fix for a clipped rotation is never a bigger number
 * somewhere. `placement.inset` and `padding` shrink the box BEFORE the
 * effects chain runs, so they make clipping worse, not better. The only real
 * cure is a bigger buffer:
 *
 *   wrap the card in a CHILD whose declared `size` is the rotated bounding
 *   box, put the rotation on the child, and the card now has margin to
 *   sweep through.
 *
 * The rotated bounding box of a w×h card at angle θ is exactly:
 *
 *   W' = w·|cos θ| + h·|sin θ|      H' = w·|sin θ| + h·|cos θ|
 *
 * Both modes draw the SAME card at the same pixel size — the only difference
 * is how much buffer sits around it. Sweep the angle in each and watch one
 * of them lose its corners.
 */

export type RotateHeadroomProps = {
  /** Rotation in degrees, clockwise. */
  angle?: number;
  /** "in-place": rotate the card itself. "headroom": rotate a padded child. */
  mode?: "in-place" | "headroom";
};

const ID = "@m0saic-starter/compose/rotate-headroom/v1";
const MODES = ["in-place", "headroom"] as const;
const CHILD_REF = "card";
const CARD_BG = "#EF7525" as MosaicColor;
const CARD_INK = "#17202a" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

/** The card's own footprint, as a fraction of the canvas. */
const CARD_FRAC = 0.55;

const propsSchema = definePropsSchema<RotateHeadroomProps>({
  angle: {
    type: "number",
    required: false,
    description: "Rotation in degrees, clockwise. The corner loss peaks near 45.",
    meta: {
      constraints: { min: -45, max: 45 },
      control: { step: 5 },
      ui: { label: "Angle" },
    },
  },
  mode: {
    type: "string",
    required: false,
    description:
      "\"in-place\": the rotation sits on the card, whose buffer is exactly the card — corners clip. \"headroom\": the card rides a child whose declared size is the rotated bounding box, and the rotation sits on the CHILD — same card, room to turn.",
    meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
  },
});

/** The axis-aligned box a w×h rect needs once rotated by `deg`. */
function rotatedBounds(w: number, h: number, deg: number): { width: number; height: number } {
  const rad = (Math.abs(deg) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: Math.ceil(w * cos + h * sin),
    height: Math.ceil(w * sin + h * cos),
  };
}

/** The rect that centers `inner` inside an `outer` box. */
function centeredRect(
  outer: { width: number; height: number },
  inner: { width: number; height: number },
): { x: number; y: number; w: number; h: number } {
  return {
    x: Math.round((outer.width - inner.width) / 2),
    y: Math.round((outer.height - inner.height) / 2),
    w: inner.width,
    h: inner.height,
  };
}

export const RotateHeadroomV1 = defineMosaicTemplate<RotateHeadroomProps>({
  id: asTemplateId(ID),
  label: "47 · Rotate Headroom",
  version: 1,
  description:
    "effects.rotate spins content inside a buffer that never grows, so corners clip. The cure isn't a bigger inset — it's a child whose declared size is the rotated bounding box (W' = w·|cos θ| + h·|sin θ|), carrying the rotation instead.",
  capabilities: { tier: "core" },
  tags: ["compose", "effects", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Set Angle to 30 and flip between the two modes — same card, one keeps its corners.",
  },

  propsSchema,
  defaultProps: { angle: 20, mode: "in-place" },

  async render(
    props: RotateHeadroomProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const angle = props.angle ?? 20;
    const mode = props.mode ?? "in-place";

    const problems: string[] = [];
    if (!Number.isFinite(angle) || angle < -45 || angle > 45) {
      problems.push(`angle must be -45..45 degrees, got ${JSON.stringify(angle)}`);
    }
    if (!MODES.includes(mode as (typeof MODES)[number])) {
      problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // Everything above the caption band. The card's box grows with the
    // angle in headroom mode, so the caption gets its own row rather than
    // an overlay — a padded box would otherwise sit on top of it.
    const area = { width, height: Math.round((height * 5) / 6) };

    // The card is the same size in both modes. Only its buffer differs.
    const card = {
      width: Math.round(area.width * CARD_FRAC),
      height: Math.round(area.height * CARD_FRAC),
    };
    const needed = rotatedBounds(card.width, card.height, angle);
    // Clamped so a steep angle can't ask for more room than exists: the
    // child still DECLARES the full padded size, so `contain` scales it
    // down uniformly instead of clipping it.
    const box =
      mode === "headroom"
        ? {
            width: Math.min(needed.width, area.width),
            height: Math.min(needed.height, area.height),
          }
        : card;

    // A drawtext card: glyphs and panel are baked INTO the content buffer,
    // so the rotation is visible. (An svg-rasterized label would rotate its
    // fill under an axis-aligned glyph mask — masks are a SHAPE effect,
    // applied after rotation, so the letters wouldn't turn at all.)
    const cardSource: MosaicSource = {
      type: "text",
      renderMode: { kind: "image" },
      visual: { backgroundColor: solidBackground(CARD_BG) },
      layers: [
        {
          content: { kind: "literal", text: `${angle} deg` },
          style: { fontSize: Math.round(card.height * 0.28), fontColor: CARD_INK },
        },
      ],
    } as MosaicTextSource;

    const children: Record<string, MosaicDocument> = {};
    let tileSource: MosaicSource;

    if (mode === "headroom") {
      // The child's DECLARED size is the whole point: it is the buffer the
      // rotation gets to use, and it is also the child's aspect signal.
      //
      // Centering the card inside it via placeInsetPieces, NOT pixel-weight
      // splits: padding spelled as raw weights makes the child's own string
      // demand near-canvas precision, and precision is hereditary — the
      // parent inherits it. Coarse cells plus a recovery inset keep the
      // exact rect and a small floor.
      const childInner = placeInsetPieces({
        rootW: needed.width,
        rootH: needed.height,
        pieces: [
          { rect: { ...centeredRect(needed, card), importance: 1 }, source: cardSource },
        ],
      });
      children[CHILD_REF] = {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String(childInner.m0, `${ID}:child`),
        assets: {},
        size: { width: needed.width, height: needed.height },
        sources: childInner.sources,
      };
      tileSource = {
        type: "mosaic",
        ref: CHILD_REF,
        placement: { fit: "contain" },
        effects: { rotate: angle },
      } as MosaicSource;
    } else {
      // The rotation sits on the card, whose buffer IS the card.
      tileSource = { ...cardSource, effects: { rotate: angle } } as MosaicSource;
    }

    // Parent geometry, same doctrine: the box is an exact rect, so it gets a
    // coarse lattice cell plus a recovery inset instead of pixel weights.
    // Spelling this pair as raw splits produced a 5,000-character m0 whose
    // precision floor sat ABOVE 720p — the layout rendered, but any parent
    // nesting it inherited that floor.
    const captionRect = {
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.87),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.11),
    };
    const growthPct = Math.round((needed.width / card.width - 1) * 100);
    const caption =
      mode === "headroom"
        ? `headroom: child declared ${box.width}x${box.height} for a ${card.width}x${card.height} card ` +
          `(+${growthPct}% wide at ${angle} deg) - the rotation rides the CHILD, so nothing clips`
        : `in-place: the buffer stays ${card.width}x${card.height}, but ${angle} deg needs ` +
          `${needed.width}x${needed.height} (+${growthPct}% wide) - the corners are clipped`;

    const placed = placeInsetPieces({
      rootW: width,
      rootH: height,
      pieces: [
        {
          rect: {
            ...centeredRect({ width, height: area.height }, box),
            importance: 1,
          },
          source: tileSource,
        },
        {
          rect: { ...captionRect, importance: 10 },
          source: svgLabel(caption, captionRect.w, captionRect.h, {
            maxPx: Math.round(height * 0.028),
            maxLines: 2,
            color: mode === "headroom" ? INK_DIM : ("#e67e22" as MosaicColor),
          }),
        },
      ],
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(placed.m0, ID),
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      ...(mode === "headroom" ? { children } : {}),
      sources: placed.sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Rotate Headroom",
    lines: [
      "effects.rotate is IN-PLACE: the buffer keeps its size, so content corners that leave it are clipped.",
      "inset and padding shrink the box BEFORE the effects chain, which makes the clipping worse, not better.",
      "The cure is real geometry: a child whose declared size is the rotated bounding box, carrying the rotation.",
      "Rotation is a CONTENT effect applied before masks - rotate svg text and the letters never turn.",
    ],
    explore: [
      "Set Angle 30 and flip modes - same card, one keeps its corners",
      "Sweep to 45 in headroom and watch the child size grow",
      "Set Angle 0: the child collapses to a plain \"1\"",
      "Structure dock: in headroom the rotation is on the CHILD",
    ],
  }),
});

export default RotateHeadroomV1;
