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
export declare const COMPOSITE_LINE_DEFAULTS: {
    readonly handle: "@qsbuilds";
    readonly year: 2026;
    readonly pageColor: "#1c2833";
};
/** The composite line: two props, one string. */
export declare const byline: (handle: string, year: number) => string;
export declare const CompositeLineV1: import("@m0saic/types").MosaicTemplate<CompositeLineProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CompositeLineV1;
