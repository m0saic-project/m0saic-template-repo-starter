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
 * (connections/weighted-cards, lesson 70) is objectRows grown into reorderable cards with composite
 * cells — so learning the columns contract once pays four times.
 *
 * As always: the editor machinery is EDIT-time sugar. Render receives the
 * plain array (possibly as a JSON string from a hand editor), validates it,
 * and draws — here a proportional breakdown bar, the shape this prop
 * pattern most often feeds (chart segments, budget splits, phase plans).
 */
export type SegmentEntry = {
    label: string;
    value: number;
    color?: string;
};
export type RowEditorsProps = {
    /** The breakdown: repeating rows of label / value / color. */
    segments?: SegmentEntry[] | string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** New rows seed their color cell from this, in order. */
export declare const SEGMENT_PALETTE: string[];
/** Parse + validate (editors may deliver a JSON string). */
export declare function parseSegments(raw: RowEditorsProps["segments"]): SegmentEntry[];
export declare const RowEditorsV1: import("@m0saic/types").MosaicTemplate<RowEditorsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RowEditorsV1;
