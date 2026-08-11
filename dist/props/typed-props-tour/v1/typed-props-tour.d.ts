/**
 * `@m0saic-starter/props/typed-props-tour/v1` — one prop of each scalar
 * type, each visibly driving the render.
 *
 * ONE CONCEPT: the typed props surface. A template declares its knobs with
 * `definePropsSchema` — the TYPE picks the sidebar control (string → text
 * field, number → numeric input with min/max, boolean → toggle, oneOf →
 * enum select) — and every optional prop carries a deterministic default.
 * The schema is DOCUMENTATION for hosts; render() re-validates everything,
 * because the CLI (and any host) can call it with a raw props bag.
 *
 * Each prop maps to something you can SEE move:
 *   - `title`  (string)  — the header text.
 *   - `tiles`  (number)  — how many columns the middle band splits into.
 *   - `accent` (boolean) — whether the marker row renders at all.
 *   - `align`  (enum)    — which third of the marker row holds the marker.
 * The caption prints the exact values render() received — the receipt.
 */
export type TypedPropsTourProps = {
    /** Header text (ASCII, 1-40 chars). */
    title?: string;
    /** Columns in the middle band (1-8). */
    tiles?: number;
    /** Render the marker row at all? */
    accent?: boolean;
    /** Which third of the marker row holds the marker. */
    align?: "left" | "center" | "right";
};
export declare const TypedPropsTourV1: import("@m0saic/types").MosaicTemplate<TypedPropsTourProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default TypedPropsTourV1;
