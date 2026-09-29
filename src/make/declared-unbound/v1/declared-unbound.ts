import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  mulberry32,
  placeInsetPieces,
  svgLabel,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/make/declared-unbound/v1` — what a compliant NON-binding
 * looks like.
 *
 * ONE CONCEPT: the roll call from the other side. `bindingsDeclared` (a
 * THROW since 0.3.0) says every prop that COULD carry a canvas handle is
 * either bound, or named in `template.bindings.unbound` with the reason it
 * has none. Lesson 81 is the "bound" half; this card is the "declared" half,
 * because what a correct non-binding looks like is the part nobody guesses.
 *
 * One label is bound. Five accountable props are honestly unbound — no rect
 * SHOWS them, so no rect can be their handle:
 *
 *   columns  geometry — a COUNT of tiles, not a value on any one
 *   gap      geometry — a split weight, never drawn
 *   seed     determinism — deals the tint order, never drawn
 *   padding  geometry — an inset, never drawn
 *   accent   painted on EVERY tile — no single rect is its handle
 *
 * And one prop needs neither: `pageColor` IS `document.backgroundColor`. It
 * has no source and no rect, so no handle can exist — and it is the way a
 * canvas should be filled (a full-frame base rect is the `canvasFill` smell).
 *
 * The rule that bites: a STALE declaration is a violation too — naming a prop
 * that cannot carry a handle (a boolean, a closed set), naming one that is in
 * fact bound, or leaving the reason empty. An entry claims a reviewer looked
 * at that prop; one honest word is the point.
 */

export type DeclaredUnboundProps = {
  /** The one bound prop — drawn above the strip. */
  label?: string;
  /** How many tiles — a count, never drawn on one. */
  columns?: number;
  /** Gutter between tiles, in percent of the canvas width. */
  gap?: number;
  /** Deals the tint order — determinism, never drawn. */
  seed?: number;
  /** Inset from the canvas edges, in percent of the canvas width. */
  padding?: number;
  /** The tint family painted on every tile (#rrggbb). */
  accent?: string;
  /** Backdrop (#rrggbb) — the document background, which needs nothing. */
  pageColor?: string;
};

const ID = "@m0saic-starter/make/declared-unbound/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2" as MosaicColor;
const DIM = "#9aa7b4" as MosaicColor;
const COLUMNS_MIN = 2;
const COLUMNS_MAX = 10;
const GAP_MAX = 4;
const PADDING_MAX = 12;
const SEED_MAX = 2147483647;

export const DECLARED_UNBOUND_DEFAULTS = {
  label: "declared unbound",
  columns: 6,
  gap: 1,
  seed: 7,
  padding: 6,
  accent: "#ee7525",
  pageColor: "#1c2833",
} as const;

/** `n` tints of one colour, darkest first — mixed toward white. */
export function tintsOf(hex: string, n: number): string[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number, m: number) => Math.round(c + (255 - c) * m);
  const to2 = (c: number) => c.toString(16).padStart(2, "0");
  return Array.from({ length: n }, (_, i) => {
    const m = n === 1 ? 0 : (i / (n - 1)) * 0.6;
    return `#${to2(mix(r, m))}${to2(mix(g, m))}${to2(mix(b, m))}`;
  });
}

/** The order the tints are dealt in — Fisher-Yates over a seeded generator. */
export function dealOrder(seed: number, n: number): number[] {
  const rng = mulberry32(seed);
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const propsSchema = definePropsSchema<DeclaredUnboundProps>({
  label: {
    type: "string",
    required: false,
  },
  columns: {
    type: "number",
    required: false,
    meta: { constraints: { min: COLUMNS_MIN, max: COLUMNS_MAX }, control: { step: 1 }, },
  },
  gap: {
    type: "number",
    required: false,
    meta: { constraints: { min: 0, max: GAP_MAX }, control: { step: 0.5 }, },
  },
  seed: {
    type: "number",
    required: false,
    meta: { constraints: { min: 0, max: SEED_MAX }, control: { step: 1 }, },
  },
  padding: {
    type: "number",
    required: false,
    meta: { constraints: { min: 0, max: PADDING_MAX }, control: { step: 1 }, },
  },
  accent: {
    type: "string",
    required: false,
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#ee7525" },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
    },
  },
});

export const DeclaredUnboundV1 = defineMosaicTemplate<DeclaredUnboundProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Static card. The label is the only handle; every other knob changes the strip from the panel.",
  },

  propsSchema,
  defaultProps: { ...DECLARED_UNBOUND_DEFAULTS },

  // THE LESSON. Every prop that could carry a handle is bound (label) or named
  // here with the reason it has none. pageColor is absent on purpose: it is the
  // document background, and a colour with no rect needs neither.
  bindings: {
    unbound: {
      columns: "geometry — a COUNT of tiles, not a value on any one",
      gap: "geometry — a split weight, never drawn",
      seed: "determinism — deals the tint order, never drawn",
      padding: "geometry — an inset, never drawn",
      accent: "painted on every tile — no single rect is its handle",
    },
  },

  async render(
    props: DeclaredUnboundProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    // The schema is documentation; render() is the gate.
    const label = props.label ?? DECLARED_UNBOUND_DEFAULTS.label;
    const columns = props.columns ?? DECLARED_UNBOUND_DEFAULTS.columns;
    const gap = props.gap ?? DECLARED_UNBOUND_DEFAULTS.gap;
    const seed = props.seed ?? DECLARED_UNBOUND_DEFAULTS.seed;
    const padding = props.padding ?? DECLARED_UNBOUND_DEFAULTS.padding;
    const accent = props.accent ?? DECLARED_UNBOUND_DEFAULTS.accent;
    if (typeof label !== "string") throw new Error(`${ID}: label must be a string.`);
    if (!Number.isInteger(columns) || columns < COLUMNS_MIN || columns > COLUMNS_MAX) {
      throw new Error(`${ID}: columns must be an integer in [${COLUMNS_MIN}, ${COLUMNS_MAX}].`);
    }
    if (typeof gap !== "number" || !Number.isFinite(gap) || gap < 0 || gap > GAP_MAX) {
      throw new Error(`${ID}: gap must be a number in [0, ${GAP_MAX}].`);
    }
    if (!Number.isInteger(seed) || seed < 0 || seed > SEED_MAX) {
      throw new Error(`${ID}: seed must be an integer in [0, ${SEED_MAX}].`);
    }
    if (!Number.isInteger(padding) || padding < 0 || padding > PADDING_MAX) {
      throw new Error(`${ID}: padding must be an integer in [0, ${PADDING_MAX}].`);
    }
    if (!HEX.test(accent)) throw new Error(`${ID}: accent ${JSON.stringify(accent)} must be #rrggbb.`);
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const page = (props.pageColor ?? DECLARED_UNBOUND_DEFAULTS.pageColor) as MosaicColor;
    const { width: W, height: H } = ctx.target;
    const px = (fx: number, fy: number, fw: number, fh: number) => ({
      x: Math.round(fx * W),
      y: Math.round(fy * H),
      w: Math.round(fw * W),
      h: Math.round(fh * H),
    });
    const text = (s: string, box: { w: number; h: number }, maxPx: number, color: MosaicColor) =>
      svgLabel(s || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });

    const pieces: Parameters<typeof placeInsetPieces>[0]["pieces"] = [];
    const piece = (rect: { x: number; y: number; w: number; h: number }, importance: number, source: MosaicSource) =>
      pieces.push({ rect: { ...rect, importance }, source });

    // No backdrop rect: the DOCUMENT fills the canvas (backgroundColor below).
    const head = px(0.06, 0.06, 0.88, 0.09);
    piece(head, 2, text("DECLARED UNBOUND - the honest non-binding", head, 0.04, INK));

    // The ONE bound prop.
    const lab = px(0.06, 0.18, 0.88, 0.08);
    piece(lab, 2, bindProp(text(label, lab, 0.036, INK), "label"));

    // The strip: `columns` tiles, `gap` apart, `padding` in, tints of `accent`
    // dealt by `seed`. Four props, five with the colour, and not one of them is
    // a value any single rect shows.
    const padPx = Math.round((padding / 100) * W);
    const gapPx = Math.round((gap / 100) * W);
    const tileW = Math.floor((W - 2 * padPx - (columns - 1) * gapPx) / columns);
    const stripY = Math.round(0.3 * H);
    const stripH = Math.round(0.3 * H);
    const tints = tintsOf(accent, columns);
    const order = dealOrder(seed, columns);
    for (let i = 0; i < columns; i++) {
      piece(
        { x: padPx + i * (tileW + gapPx), y: stripY, w: tileW, h: stripH },
        1,
        makeColorTile(tints[order[i]] as MosaicColor),
      );
    }

    // The receipt - the three categories, in words.
    const r1 = px(0.06, 0.66, 0.88, 0.055);
    piece(r1, 2, text("bound: label", r1, 0.024, DIM));
    const r2 = px(0.06, 0.725, 0.88, 0.055);
    piece(r2, 2, text("declared in bindings.unbound: columns, gap, seed, padding, accent - each with its reason", r2, 0.022, DIM));
    const r3 = px(0.06, 0.79, 0.88, 0.055);
    piece(r3, 2, text("needs nothing: pageColor - it IS document.backgroundColor, so no rect exists to be its handle", r3, 0.022, DIM));
    const cap = px(0.06, 0.88, 0.88, 0.05);
    piece(cap, 2, text("a stale declaration is a violation too - one honest word per prop is the point", cap, 0.022, DIM));

    const placed = placeInsetPieces({ rootW: W, rootH: H, pieces });
    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(placed.m0, ID),
      assets: {},
      backgroundColor: page,
      sources: placed.sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Declared Unbound",
    lines: [
      "Every prop that COULD carry a canvas handle is bound or named in bindings.unbound with its reason. Neither is a build failure.",
      "Here one label is bound; columns, gap, seed, padding and accent are honest non-bindings - geometry, determinism, a colour on every tile.",
      "The page colour needs nothing: it IS document.backgroundColor, so no rect exists to be its handle.",
    ],
    explore: [
      "Double-click the label - the one handle on the card",
      "Change Columns or Seed - the strip re-deals; nothing to click",
      "Read bindings.unbound in the source - one reason per prop",
    ],
  }),
});

export default DeclaredUnboundV1;
