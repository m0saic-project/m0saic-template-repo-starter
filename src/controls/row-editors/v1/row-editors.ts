import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/row-editors/v1` — an array-of-objects prop that
 * edits like a form, not like JSON.
 *
 * ONE CONCEPT: `flavor: "objectRows"`. A `json` prop holding
 * `Array<{ label, value, color? }>` would default to a raw code box; declare
 * the flavor plus `columns` (one cell spec per object key — text / number /
 * color) and the editor renders a repeating-row form instead: one row per
 * entry, add / remove, each cell the right widget. `palette` seeds the color
 * cell of NEW rows, so added entries arrive on-brand instead of black.
 *
 * The same declaration family drives the richer editors nearby — `cardList`
 * (connections/weighted-cards, lesson 80) is objectRows grown into reorderable cards with composite
 * cells — so learning the columns contract once pays four times.
 *
 * (Sibling worth knowing: `flavor: "jsonModal"` renders a complex prop as
 * a compact summary plus an "Edit JSON" modal — the right fallback when a
 * shape is too rich even for rows.)
 *
 * As always: the editor machinery is EDIT-time sugar. Render receives the
 * plain array (possibly as a JSON string from a hand editor), validates it,
 * and draws — here a proportional breakdown bar, the shape this prop
 * pattern most often feeds (chart segments, budget splits, phase plans).
 */

export type SegmentEntry = { label: string; value: number; color?: string };

export type RowEditorsProps = {
  /** The breakdown: repeating rows of label / value / color. */
  segments?: SegmentEntry[] | string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/row-editors/v1";
const MAX_ROWS = 6;

/** New rows seed their color cell from this, in order. */
export const SEGMENT_PALETTE = ["#2e86c1", "#27ae60", "#ca6f1e", "#884ea0", "#c0392b", "#17a589"];

const DEFAULT_SEGMENTS: SegmentEntry[] = [
  { label: "Render", value: 46 },
  { label: "Encode", value: 27 },
  { label: "Upload", value: 17 },
  { label: "Idle", value: 10 },
];

/** Parse + validate (editors may deliver a JSON string). */
export function parseSegments(raw: RowEditorsProps["segments"]): SegmentEntry[] {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : (raw ?? DEFAULT_SEGMENTS);
  if (!Array.isArray(value) || value.length < 2 || value.length > MAX_ROWS) {
    throw new Error(`${ID}: segments must hold 2-${MAX_ROWS} rows.`);
  }
  return value.map((entry, i) => {
    const e = entry as Partial<SegmentEntry>;
    if (typeof e.label !== "string" || e.label.length === 0 || e.label.length > 16) {
      throw new Error(`${ID}: segments[${i}].label must be a 1-16 char string.`);
    }
    if (typeof e.value !== "number" || !Number.isFinite(e.value) || e.value <= 0 || e.value > 999) {
      throw new Error(`${ID}: segments[${i}].value must be a number in (0, 999].`);
    }
    if (e.color !== undefined && !HEX.test(e.color)) {
      throw new Error(`${ID}: segments[${i}].color must be #rrggbb.`);
    }
    return { label: e.label, value: e.value, ...(e.color ? { color: e.color } : {}) };
  });
}

const propsSchema = definePropsSchema<RowEditorsProps>({
  segments: {
    type: "json",
    required: false,
    description:
      "The breakdown rows. flavor objectRows + columns renders them as a repeating form (text / number / color cells); palette seeds new rows' colors. Plain Array<{label, value, color?}> at render.",
    meta: {
      constraints: {
        jsonSchema: {
          type: "array",
          minItems: 2,
          maxItems: MAX_ROWS,
          items: {
            type: "object",
            required: ["label", "value"],
            properties: {
              label: { type: "string", minLength: 1, maxLength: 16 },
              value: { type: "number", exclusiveMinimum: 0, maximum: 999 },
              color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            },
          },
        },
      },
      control: {
        flavor: "objectRows",
        columns: [
          { key: "label", kind: "text", label: "Segment", placeholder: "Render" },
          { key: "value", kind: "number", label: "Share" },
          { key: "color", kind: "color", label: "Color" },
        ],
        palette: SEGMENT_PALETTE,
      },
      ui: { label: "Segments", order: 1 },
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

export const RowEditorsV1 = defineMosaicTemplate<RowEditorsProps>({
  id: asTemplateId(ID),
  label: "21 · Row Editors",
  version: 1,
  description:
    "An array-of-objects prop that edits like a form: flavor objectRows + columns (text / number / color cells) renders a json prop as repeating rows with add and remove, and palette seeds new rows' colors so additions arrive on-brand. The columns contract is the same one cardList grows into cards — learn it once, use it four times. At render the prop is the plain array either way; here it draws the breakdown bar this pattern most often feeds.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Edit Segments: rows, not JSON. Add a row — its color arrives from the palette. The bar re-proportions from the plain array.",
  },

  propsSchema,
  defaultProps: {
    segments: DEFAULT_SEGMENTS,
    pageColor: "#1c2833",
  },

  async render(
    props: RowEditorsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const segments = parseSegments(props.segments);
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The breakdown bar: one band per row, proportional to value (Hamilton-
    // scaled to a fixed 100-slot budget), plus a legend row per segment.
    const total = segments.reduce((a, s) => a + s.value, 0);
    const bar = String(weightedSplit(segments.map((s) => s.value), "col", {
      precision: 100,
      claimants: segments.map(() => "1"),
    }));
    // Legend: [pad, then per segment: color chip, gap, label]. Weights are
    // RELATIVE — a split's cells share the width by proportion, so the row
    // needs no padding out to a round total.
    const legendW = Math.max(6, Math.floor(84 / segments.length) - 4);
    const legendRow = String(weightedSplit(
      [6, ...segments.flatMap(() => [3, 1, legendW])],
      "col",
      {
        mode: "literal",
        claimants: ["-", ...segments.flatMap(() => ["1", "-", "1"])],
      },
    ));
    const rows = String(weightedSplit([14, 30, 8, 14, 34], "row", {
      mode: "literal",
      claimants: ["-", bar, "-", legendRow, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    for (const [i, s] of segments.entries()) {
      sources.push(makeColorTile((s.color ?? SEGMENT_PALETTE[i % SEGMENT_PALETTE.length]) as MosaicColor));
    }
    for (const [i, s] of segments.entries()) {
      sources.push(makeColorTile((s.color ?? SEGMENT_PALETTE[i % SEGMENT_PALETTE.length]) as MosaicColor));
      sources.push(
        svgLabel(`${s.label} ${Math.round((s.value / total) * 100)}%`, (width * 0.8) / segments.length, height * 0.12, {
          color: "#b9c4cf" as MosaicColor,
          maxPx: Math.round(height * 0.022),
          maxLines: 2,
          vAlign: "middle",
        }),
      );
    }

    const heading = fitSvgText(
      `ROW EDITORS - ${segments.length} rows, edited as a form, rendered as proportions`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.034), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "flavor objectRows + columns [text, number, color] - a repeating-row form instead of a JSON box",
        "palette seeds NEW rows' colors - and at render the prop is the plain array either way",
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
    title: "Row Editors",
    lines: [
      "flavor objectRows + columns turns an array-of-objects json prop into a repeating-row form - one row per entry, add and remove, right widget per cell.",
      "palette seeds the color cell of NEW rows, so additions arrive on-brand instead of black.",
      "Same columns contract cardList (lesson 80) grows into cards - learn it once. Render gets the plain array either way and draws the breakdown.",
    ],
    explore: [
      "Add a row - watch the palette seed its color",
      "Change a Share number - the bar re-proportions",
    ],
  }),
});

export default RowEditorsV1;
