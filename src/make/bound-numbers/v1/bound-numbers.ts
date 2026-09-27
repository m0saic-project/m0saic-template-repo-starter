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
  placeInsetPieces,
  svgLabel,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/make/bound-numbers/v1` — three numbers a reader can
 * double-click, each drawn in a different honest spelling.
 *
 * ONE CONCEPT: a NUMBER you draw is a handle, and the gate reads the drawn
 * text to check that you bound it (`bindingsCover`, widened from strings to
 * numbers at 0.3.0). It recognises a number in its honest spellings —
 * `String(v)`, `v.toLocaleString("en-US")`, and `toFixed(1|2)` ONLY when the
 * value already carries decimals — and only on a digit boundary: `12` is not
 * read out of `2012`, and a drawn `1,200` is not the prop `200`. So format
 * the number however the card needs, then bind the rect that shows it:
 *
 *   visitors 12480 → "12,480"   toLocaleString
 *   price    3.5   → "$3.50"    toFixed(2) — decimals stay decimals
 *   year     2026  → "2026"     String
 *
 * And one number that is NOT a prop: the total (visitors × price) is derived.
 * It has no handle and needs none — bind what you show OF A PROP, not every
 * numeral on the card.
 *
 * The rule that bites: `bindingsCover` is the WEAKER second signal (a
 * warning). It cannot see a one-character spelling (`columns: 3` drawn as
 * "3"), nor a spelling it does not read ("12.5k"), nor an integer drawn with
 * decimals ("4.00" for `4`). Bind those anyway. The roll call —
 * `bindingsDeclared`, lesson 84 — is the gate; this rule is what catches a
 * number bound to the WRONG rect.
 */

export type BoundNumbersProps = {
  /** A count — drawn with thousands separators, bound to the numeral. */
  visitors?: number;
  /** A price — drawn to two decimals, bound to the numeral. */
  price?: number;
  /** A year — drawn plainly, bound to the numeral. */
  year?: number;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const ID = "@m0saic-starter/make/bound-numbers/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2" as MosaicColor;
const DIM = "#9aa7b4" as MosaicColor;
const ACCENT = "#ee7525" as MosaicColor;
const CELL = "#243342" as MosaicColor;
const VISITORS_MAX = 9_999_999;
const PRICE_MAX = 9999;
const YEAR_MIN = 1970;
const YEAR_MAX = 2999;

export const BOUND_NUMBERS_DEFAULTS = { visitors: 12480, price: 3.5, year: 2026, pageColor: "#1c2833" } as const;

/**
 * The spellings the gate reads a number in — a mirror of the audit's list,
 * kept here so the lesson's test can say what "honest" means. An integer
 * never spells with decimals: nothing draws a count as "1.0".
 */
export function honestSpellings(v: number): string[] {
  const out = [String(v), v.toLocaleString("en-US")];
  if (!Number.isInteger(v)) out.push(v.toFixed(1), v.toFixed(2));
  return [...new Set(out)];
}

/** How each number is DRAWN — the card's own formatting, each an honest spelling. */
export const drawVisitors = (v: number): string => v.toLocaleString("en-US");
export const drawPrice = (v: number): string => `$${v.toFixed(2)}`;
export const drawYear = (v: number): string => String(v);
/** Derived — not a prop, so not a handle. */
export const drawTotal = (visitors: number, price: number): string =>
  `$${(visitors * price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const propsSchema = definePropsSchema<BoundNumbersProps>({
  visitors: {
    type: "number",
    required: false,
    description:
      "A count, drawn with thousands separators (toLocaleString) and bound to the numeral that shows it. 12480 is drawn 12,480 - the gate reads that spelling.",
    meta: { constraints: { min: 0, max: VISITORS_MAX }, control: { step: 1 }, ui: { label: "Visitors", order: 1 } },
  },
  price: {
    type: "number",
    required: false,
    description:
      "A price, drawn to two decimals (toFixed) and bound. Decimals stay decimals: 3.5 is drawn 3.50 and the gate reads it; an integer drawn as 4.00 is not a spelling it reads - the binding holds either way.",
    meta: { constraints: { min: 0, max: PRICE_MAX }, control: { step: 0.25 }, ui: { label: "Price", order: 2 } },
  },
  year: {
    type: "number",
    required: false,
    description:
      "A year, drawn plainly (String) and bound. The digit boundary keeps it honest: 2026 is never read out of 20260.",
    meta: { constraints: { min: YEAR_MIN, max: YEAR_MAX }, control: { step: 1 }, ui: { label: "Year", order: 3 } },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 4 },
    },
  },
});

export const BoundNumbersV1 = defineMosaicTemplate<BoundNumbersProps>({
  id: asTemplateId(ID),
  label: "82 · Bound Numbers",
  version: 1,
  description:
    "The numeral you draw is a handle. Three numbers, three honest spellings - 12,480 (toLocaleString), $3.50 (toFixed), 2026 (String) - each bound to the rect that shows it, plus a derived total that is not a prop and needs no binding. The bindingsCover numbers rule reads exactly these spellings, on a digit boundary.",
  capabilities: { tier: "core" },
  tags: ["make", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Static card. Double-click any of the three numerals - the total is derived and has no handle.",
  },

  propsSchema,
  defaultProps: { ...BOUND_NUMBERS_DEFAULTS },

  async render(
    props: BoundNumbersProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    // The schema is documentation; render() is the gate.
    const visitors = props.visitors ?? BOUND_NUMBERS_DEFAULTS.visitors;
    const price = props.price ?? BOUND_NUMBERS_DEFAULTS.price;
    const year = props.year ?? BOUND_NUMBERS_DEFAULTS.year;
    if (!Number.isInteger(visitors) || visitors < 0 || visitors > VISITORS_MAX) {
      throw new Error(`${ID}: visitors must be an integer in [0, ${VISITORS_MAX}].`);
    }
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
      throw new Error(`${ID}: price must be a number in [0, ${PRICE_MAX}].`);
    }
    if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
      throw new Error(`${ID}: year must be an integer in [${YEAR_MIN}, ${YEAR_MAX}].`);
    }
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const page = (props.pageColor ?? BOUND_NUMBERS_DEFAULTS.pageColor) as MosaicColor;
    const { width: W, height: H } = ctx.target;
    const px = (fx: number, fy: number, fw: number, fh: number) => ({
      x: Math.round(fx * W),
      y: Math.round(fy * H),
      w: Math.round(fw * W),
      h: Math.round(fh * H),
    });
    const label = (text: string, box: { w: number; h: number }, maxPx: number, color: MosaicColor) =>
      svgLabel(text || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });

    const pieces: Parameters<typeof placeInsetPieces>[0]["pieces"] = [];
    const piece = (rect: { x: number; y: number; w: number; h: number }, importance: number, source: MosaicSource) =>
      pieces.push({ rect: { ...rect, importance }, source });

    // No backdrop rect: the DOCUMENT fills the canvas (backgroundColor below).
    const head = px(0.06, 0.06, 0.88, 0.09);
    piece(head, 2, label("BOUND NUMBERS - the numeral you draw is the handle", head, 0.04, INK));

    // Three stat tiles. Each numeral is formatted the way the card wants and
    // then BOUND to the prop it shows - the binding rides the rect, not the
    // spelling.
    const stats: Array<{ key: keyof BoundNumbersProps; caption: string; text: string }> = [
      { key: "visitors", caption: "visitors - toLocaleString", text: drawVisitors(visitors) },
      { key: "price", caption: "price - toFixed(2)", text: drawPrice(price) },
      { key: "year", caption: "year - String", text: drawYear(year) },
    ];
    stats.forEach((s, i) => {
      const x = 0.06 + i * 0.3;
      const tile = px(x, 0.2, 0.28, 0.34);
      piece(tile, 1, makeColorTile(CELL));
      const cap = px(x + 0.02, 0.22, 0.24, 0.06);
      piece(cap, 2, label(s.caption, cap, 0.022, DIM));
      const num = px(x + 0.02, 0.3, 0.24, 0.2);
      piece(num, 2, bindProp(label(s.text, num, 0.09, ACCENT), s.key));
    });

    // The total is DERIVED: visitors x price. It is a number on the card, but
    // no prop is behind it, so it is not a handle and is deliberately unbound.
    const totCap = px(0.06, 0.6, 0.3, 0.07);
    piece(totCap, 2, label("total = visitors x price", totCap, 0.026, DIM));
    const tot = px(0.38, 0.6, 0.56, 0.07);
    piece(tot, 2, label(drawTotal(visitors, price), tot, 0.04, INK));

    const cap1 = px(0.06, 0.72, 0.88, 0.055);
    piece(cap1, 2, label("the gate reads a drawn number in its honest spellings - String, toLocaleString, toFixed when it has decimals", cap1, 0.021, DIM));
    const cap2 = px(0.06, 0.785, 0.88, 0.055);
    piece(cap2, 2, label("on a digit boundary, so 12 is never read out of 2012 - and the total is derived, so it is not a handle", cap2, 0.021, DIM));
    const cap3 = px(0.06, 0.88, 0.88, 0.05);
    piece(cap3, 2, label("double-click a numeral - the inline form edits that prop", cap3, 0.022, DIM));

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
    title: "Bound Numbers",
    lines: [
      "A number you draw is a handle: bind the numeral to its prop, however the card formats it.",
      "The gate reads drawn numbers in their honest spellings - String, toLocaleString, toFixed when the value has decimals - on a digit boundary.",
      "A derived number (the total) is not a prop, so it has no handle and needs none. Bind what you show OF A PROP.",
    ],
    explore: [
      "Double-click 12,480 - the inline form edits Visitors",
      "Set Price to 4 - it draws 4.00; the binding still holds",
      "Change Year - the total does not move; it is not that kind of number",
    ],
  }),
});

export default BoundNumbersV1;
