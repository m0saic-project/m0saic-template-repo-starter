import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  bindPropPath,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  placeInsetPieces,
  svgLabel,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/make/array-rows/v1` — a `type: "array"` prop edited as
 * rows in the panel, and as leaf handles on the canvas.
 *
 * ONE CONCEPT: the `array` prop type, declared plainly. An array of objects
 * is the most common structured prop (chart segments, line items, a
 * schedule), and until 0.3.0 the schema had no word for it — nineteen
 * shipped templates wrote `type: "array" as any`. Now it is a first-class
 * type: `definePropsSchema` accepts it, `validateTemplateProps` checks it, and
 * `classifyBindableProp` has always bound its leaves.
 *
 * Two surfaces, one prop:
 *
 *   - the PANEL: `control.flavor: "objectRows"` + `columns` render the array
 *     as a repeating-row form (lesson 21 teaches this half in depth);
 *   - the CANVAS: every cell is a LEAF handle — `bindPropPath(src, "items",
 *     [i, "sku"], "string")`, a path AND a kind, because the schema carries
 *     no per-leaf type. The qty leaf carries `onClear: "remove-element"`, so
 *     committing an empty number removes the row; and the EMPTY last row is
 *     bound to `[items.length, "sku"]` with a `seedDraft`, so double-clicking
 *     it births the next row with its SKU pre-filled.
 *
 * The rule that bites: bind the row's cells to the ROW's leaves, never to a
 * derived value. A total under the table is not a leaf of any row — it is
 * drawn, and it is not a handle (lesson 82). And render still receives plain
 * data: a JSON string from a hand editor is as legal as the array the form
 * produces, so parse before drawing.
 */

export type ArrayRow = { sku: string; qty: number; color: string };

export type ArrayRowsProps = {
  /** The rows - Array<{sku, qty, color}>, or its JSON string from a hand editor. */
  items?: ArrayRow[] | string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const ID = "@m0saic-starter/make/array-rows/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2" as MosaicColor;
const DIM = "#9aa7b4" as MosaicColor;
const CELL = "#243342" as MosaicColor;
const ADD = "#2e3d4d" as MosaicColor;
export const MAX_ROWS = 6;
const QTY_MAX = 9999;

/** New rows seed their colour cell from this, in order. */
export const ROW_PALETTE = ["#2e86c1", "#27ae60", "#ca6f1e", "#884ea0", "#c0392b", "#17a589"];

export const DEFAULT_ITEMS: ArrayRow[] = [
  { sku: "SKU-001", qty: 12, color: "#2e86c1" },
  { sku: "SKU-002", qty: 4, color: "#27ae60" },
  { sku: "SKU-003", qty: 30, color: "#ca6f1e" },
];

/** Parse + validate (editors may deliver a JSON string). */
export function parseItems(raw: ArrayRowsProps["items"]): ArrayRow[] {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : (raw ?? DEFAULT_ITEMS);
  if (!Array.isArray(value) || value.length > MAX_ROWS) {
    throw new Error(`${ID}: items must hold up to ${MAX_ROWS} rows.`);
  }
  return value.map((entry, i) => {
    const e = entry as Partial<ArrayRow>;
    if (typeof e.sku !== "string" || e.sku.length === 0 || e.sku.length > 16) {
      throw new Error(`${ID}: items[${i}].sku must be a 1-16 char string.`);
    }
    if (!Number.isInteger(e.qty) || (e.qty as number) < 0 || (e.qty as number) > QTY_MAX) {
      throw new Error(`${ID}: items[${i}].qty must be an integer in [0, ${QTY_MAX}].`);
    }
    if (typeof e.color !== "string" || !HEX.test(e.color)) {
      throw new Error(`${ID}: items[${i}].color must be #rrggbb.`);
    }
    return { sku: e.sku, qty: e.qty as number, color: e.color };
  });
}

/** The SKU the add handle pre-fills for the row it would create. */
export const nextSku = (items: ArrayRow[]): string => `SKU-${String(items.length + 1).padStart(3, "0")}`;

const propsSchema = definePropsSchema<ArrayRowsProps>({
  items: {
    // The 0.3.0 prop type: an array of objects, declared plainly - no cast.
    type: "array",
    required: false,
    meta: {
      constraints: {
        jsonSchema: {
          type: "array",
          maxItems: MAX_ROWS,
          items: {
            type: "object",
            required: ["sku", "qty", "color"],
            properties: {
              sku: { type: "string", minLength: 1, maxLength: 16 },
              qty: { type: "integer", minimum: 0, maximum: QTY_MAX },
              color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            },
          },
        },
      },
      control: {
        flavor: "objectRows",
        columns: [
          { key: "sku", kind: "text", label: "SKU", placeholder: "SKU-001" },
          { key: "qty", kind: "number", label: "Qty" },
          { key: "color", kind: "color", label: "Color" },
        ],
        palette: ROW_PALETTE,
      },
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

export const ArrayRowsV1 = defineMosaicTemplate<ArrayRowsProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Static card. Double-click a cell to edit that leaf; clear a qty to remove its row; double-click the empty last row to add one.",
  },

  propsSchema,
  defaultProps: {
    items: DEFAULT_ITEMS,
    pageColor: "#1c2833",
  },

  async render(
    props: ArrayRowsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const items = parseItems(props.items);
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;
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
    const head = px(0.06, 0.05, 0.88, 0.08);
    piece(head, 2, label("ARRAY ROWS - a type array prop, every cell a leaf handle", head, 0.036, INK));

    // Column captions - static, not props.
    const hSku = px(0.14, 0.15, 0.4, 0.05);
    piece(hSku, 2, label("sku - string leaf", hSku, 0.02, DIM));
    const hQty = px(0.56, 0.15, 0.16, 0.05);
    piece(hQty, 2, label("qty - number leaf", hQty, 0.02, DIM));
    const hCol = px(0.06, 0.15, 0.06, 0.05);
    piece(hCol, 2, label("color", hCol, 0.02, DIM));

    // One row per item. Each cell binds THIS row's leaf: a path into the value
    // plus the leaf's kind - the schema has no per-leaf type to infer it from.
    const ROW_Y = 0.21;
    const ROW_H = 0.075;
    const ROW_STEP = 0.085;
    items.forEach((row, i) => {
      const y = ROW_Y + i * ROW_STEP;
      const chip = px(0.06, y, 0.06, ROW_H);
      piece(chip, 2, bindPropPath(makeColorTile(row.color as MosaicColor), "items", [i, "color"], "color"));
      const sku = px(0.14, y, 0.4, ROW_H);
      piece(sku, 1, makeColorTile(CELL));
      piece(sku, 2, bindPropPath(label(row.sku, sku, 0.032, INK), "items", [i, "sku"], "string"));
      const qty = px(0.56, y, 0.16, ROW_H);
      piece(qty, 1, makeColorTile(CELL));
      // An EMPTY commit here removes the whole row - the panel's remove button, on the canvas.
      piece(qty, 2, bindPropPath(label(String(row.qty), qty, 0.032, INK), "items", [i, "qty"], "number", { onClear: "remove-element" }));
    });

    // The add handle: an EMPTY rect bound to the row that does not exist yet.
    // "Bind even when the value is empty" - the rect is a handle to ADD, and
    // the seed pre-fills the SKU a reader would have typed anyway.
    if (items.length < MAX_ROWS) {
      const y = ROW_Y + items.length * ROW_STEP;
      const add = px(0.14, y, 0.58, ROW_H);
      piece(add, 1, makeColorTile(ADD));
      piece(
        add,
        2,
        bindPropPath(label("+ add a row - double-click", add, 0.026, DIM), "items", [items.length, "sku"], "string", {
          seedDraft: nextSku(items),
        }),
      );
    }

    const cap1 = px(0.06, 0.8, 0.88, 0.055);
    piece(cap1, 2, label('type "array" + flavor objectRows: rows in the panel; here each cell is a leaf handle - a path AND a kind', cap1, 0.021, DIM));
    const cap2 = px(0.06, 0.865, 0.88, 0.055);
    piece(cap2, 2, label("clear a qty to remove its row; the empty last row is bound to the row that does not exist yet", cap2, 0.021, DIM));

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
    title: "Array Rows",
    lines: [
      'type "array" is a first-class prop type since 0.3.0 - an array of objects, declared plainly, no cast.',
      "In the panel, flavor objectRows + columns edit it as rows. On the canvas, every cell is a LEAF handle: bindPropPath with a path AND a kind.",
      "onClear remove-element makes an empty qty delete its row; the empty last row is bound to the next index, so double-clicking it adds one.",
    ],
    explore: [
      "Double-click a SKU or a qty - that leaf, that row",
      "Clear a qty and commit - the row is gone",
      "Double-click the empty last row - a new row, SKU pre-filled",
    ],
  }),
});

export default ArrayRowsV1;
