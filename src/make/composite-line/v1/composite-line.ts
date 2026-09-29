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
  bindProps,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  placeInsetPieces,
  svgLabel,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/make/composite-line/v1` — one rect that draws two props,
 * and keeps both handles.
 *
 * ONE CONCEPT: the composite line. `"@qsbuilds - 2026 on GitHub"` is ONE
 * rect drawing TWO props. A single `editor.binding` names one of them, and a
 * second `bindProp` on the same source REPLACES the first — one handle
 * survives and the other prop reads as unbound. `bindProps` writes
 * `editor.bindings`, several handles on one rect:
 *
 *   bindProps(src, [{ propKey: "handle" }, { propKey: "year", kind: "number" }])
 *
 * Make then opens the rect with both fields, and the roll call sees both
 * props accounted for. The other correct form is to SPLIT the line so each
 * prop has its own rect — shown underneath, so a reader can compare.
 *
 * The rule that bites: `@m0saic/github/year-card/v1` draws exactly this line
 * with a bare `bindProp`. It is frozen, so the fix is its v2, and until then
 * `bindingsCover` warns on it every build — by design. Do it right on the
 * first version, because a shipped one cannot be edited in place.
 */

export type CompositeLineProps = {
  /** The handle — the first prop on the byline. */
  handle?: string;
  /** The year — the second prop on the SAME byline rect. */
  year?: number;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const ID = "@m0saic-starter/make/composite-line/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2" as MosaicColor;
const DIM = "#9aa7b4" as MosaicColor;
const ACCENT = "#ee7525" as MosaicColor;
const CELL = "#243342" as MosaicColor;
const YEAR_MIN = 1970;
const YEAR_MAX = 2999;

export const COMPOSITE_LINE_DEFAULTS = { handle: "@qsbuilds", year: 2026, pageColor: "#1c2833" } as const;

/** The composite line: two props, one string. */
export const byline = (handle: string, year: number): string => `${handle} - ${year} on GitHub`;

const propsSchema = definePropsSchema<CompositeLineProps>({
  handle: {
    type: "string",
    required: false,
    description: "The handle on the byline. Bound twice on this card: once as one of two handles on the composite rect, once on its own split rect.",
    meta: { control: { placeholder: "@handle" }, ui: { label: "Handle", order: 1 } },
  },
  year: {
    type: "number",
    required: false,
    description: "The year on the byline - the second prop on the SAME composite rect (kind number), and on its own split rect.",
    meta: { constraints: { min: YEAR_MIN, max: YEAR_MAX }, control: { step: 1 }, ui: { label: "Year", order: 2 } },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const CompositeLineV1 = defineMosaicTemplate<CompositeLineProps>({
  id: asTemplateId(ID),
  label: "83 · Composite Line",
  version: 1,
  description:
    "One rect drawing two props - \"@handle - 2026 on GitHub\" - keeps BOTH handles with bindProps; a second bindProp would replace the first. The same line shown split, one rect per prop, as the other correct form.",
  capabilities: { tier: "core" },
  tags: ["make", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Static card. Double-click the byline: two fields. Double-click either split rect: one field.",
  },

  propsSchema,
  defaultProps: { ...COMPOSITE_LINE_DEFAULTS },

  async render(
    props: CompositeLineProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    // The schema is documentation; render() is the gate.
    const handle = props.handle ?? COMPOSITE_LINE_DEFAULTS.handle;
    const year = props.year ?? COMPOSITE_LINE_DEFAULTS.year;
    if (typeof handle !== "string") throw new Error(`${ID}: handle must be a string.`);
    if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
      throw new Error(`${ID}: year must be an integer in [${YEAR_MIN}, ${YEAR_MAX}].`);
    }
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const page = (props.pageColor ?? COMPOSITE_LINE_DEFAULTS.pageColor) as MosaicColor;
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
    piece(head, 2, label("COMPOSITE LINE - one rect, two props, both handles", head, 0.04, INK));

    // A. ONE rect, TWO knobs. bindProps writes editor.bindings; Make opens the
    //    rect with a field per entry, and the roll call sees both props bound.
    const capA = px(0.06, 0.2, 0.88, 0.055);
    piece(capA, 2, label("bindProps - ONE rect keeps BOTH knobs", capA, 0.024, DIM));
    const line = px(0.06, 0.27, 0.88, 0.13);
    piece(line, 1, makeColorTile(CELL));
    const lineText = px(0.08, 0.29, 0.84, 0.09);
    piece(
      lineText,
      2,
      bindProps(label(byline(handle, year), lineText, 0.055, ACCENT), [
        { propKey: "handle" },
        { propKey: "year", kind: "number" },
      ]),
    );

    // B. Or split the line - one rect per prop, one bindProp each. Equally
    //    correct; the choice is layout, not provenance.
    const capB = px(0.06, 0.47, 0.88, 0.055);
    piece(capB, 2, label("or split the line - one rect per prop", capB, 0.024, DIM));
    const left = px(0.06, 0.54, 0.42, 0.13);
    piece(left, 1, makeColorTile(CELL));
    const leftText = px(0.08, 0.56, 0.38, 0.09);
    piece(leftText, 2, bindProp(label(handle, leftText, 0.05, INK), "handle"));
    const right = px(0.52, 0.54, 0.42, 0.13);
    piece(right, 1, makeColorTile(CELL));
    const rightText = px(0.54, 0.56, 0.38, 0.09);
    piece(rightText, 2, bindProp(label(`${year} on GitHub`, rightText, 0.05, INK), "year"));

    // The pitfall, in words - and locked in the test.
    const cap1 = px(0.06, 0.76, 0.88, 0.055);
    piece(cap1, 2, label("never bindProp twice on one rect - the second REPLACES the first", cap1, 0.022, DIM));
    const cap2 = px(0.06, 0.825, 0.88, 0.055);
    piece(cap2, 2, label("year-card/v1 does exactly that, and being frozen it warns until its v2", cap2, 0.022, DIM));
    const cap3 = px(0.06, 0.9, 0.88, 0.05);
    piece(cap3, 2, label("double-click the byline - two fields; a split rect - one", cap3, 0.022, DIM));

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
    title: "Composite Line",
    lines: [
      "One rect that draws two props needs two handles. bindProps(src, [{handle}, {year}]) keeps both; Make offers both on double-click.",
      "A second bindProp on the same rect REPLACES the first - one handle survives and the other prop reads as unbound.",
      "The other correct form is to split the line so each prop has its own rect. Either way, every prop you show stays a handle.",
    ],
    explore: [
      "Double-click the byline - two fields, handle and year",
      "Double-click the split rects - one field each",
      "Set Year to 2027 - both forms follow",
    ],
  }),
});

export default CompositeLineV1;
