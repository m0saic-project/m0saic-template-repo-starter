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
export type ArrayRow = {
    sku: string;
    qty: number;
    color: string;
};
export type ArrayRowsProps = {
    /** The rows - Array<{sku, qty, color}>, or its JSON string from a hand editor. */
    items?: ArrayRow[] | string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const MAX_ROWS = 6;
/** New rows seed their colour cell from this, in order. */
export declare const ROW_PALETTE: string[];
export declare const DEFAULT_ITEMS: ArrayRow[];
/** Parse + validate (editors may deliver a JSON string). */
export declare function parseItems(raw: ArrayRowsProps["items"]): ArrayRow[];
/** The SKU the add handle pre-fills for the row it would create. */
export declare const nextSku: (items: ArrayRow[]) => string;
export declare const ArrayRowsV1: import("@m0saic/types").MosaicTemplate<ArrayRowsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ArrayRowsV1;
