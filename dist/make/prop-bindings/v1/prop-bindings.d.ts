/**
 * `@m0saic-starter/make/prop-bindings/v1` — a card whose every rect knows
 * which prop drew it, one rect per bindable kind.
 *
 * ONE CONCEPT: provenance. The rect that DISPLAYS a prop is bound to it
 * (`editor.binding` / `editor.bindings`, written by `bindProp` and its
 * siblings), and Make derives "double-click this rect -> edit that knob"
 * from the binding on every render. Every kind the platform can bind is on
 * the card:
 *
 *   bindProp(src, "title")                           free text
 *   bindProps(src, [{title, layer 0}, {subtitle, 1}]) a header OVER a subtitle:
 *                                                    one rect, two knobs, a
 *                                                    stacked form in Make
 *   bindProp(colorTile, "accentColor")               a colour string: the
 *                                                    swatch opens a picker
 *   bindProp(src, "count")                           a number
 *   bindProp(src, "bullets", i)                      ONE element of a string[]
 *   bindProp(src, "scores", i)                       ONE element of a number[]
 *   bindPropPath(src, "rows", [i, "name"], "string") a LEAF of a json row list,
 *     ... [i, "value"], "number"  ... [i, "color"], "color"   path AND kind, always
 *   bindPropRange(src, "code", undefined, line, tok) ONE LINE of a multi-line
 *                                                    string, + the token to
 *                                                    pre-select
 *
 * and one deliberate NON-binding: `mode` is a closed set (`oneOf`), drawn as
 * a chip. Closed pickers are not bindable, so the chip gets no pencil. Which
 * props are bindable is decided ONCE, in the platform; this lesson's test
 * asks the same predicate Make does, so template and page can never disagree.
 *
 * The rule that bites: the per-render `stableKey` is OUTPUT. Never author a
 * binding against it - the geometry re-keys whenever it changes, and the
 * binding rides the SOURCE, which is positional. Bind the rect that SHOWS
 * the value (not derived text), and bind it even when the value is empty:
 * the empty rect is the "add" handle. The build gate warns when a template
 * draws a free-text prop it never bound (`bindingsCover`) and FAILS when a
 * binding names a prop the schema lacks or cannot bind (`bindingsSound`).
 */
export type PropBindingsRow = {
    name: string;
    value: number;
    color: string;
};
export type PropBindingsProps = {
    /** Headline - layer 0 of the header rect. */
    title?: string;
    /** Under the headline - layer 1 of the SAME rect. */
    subtitle?: string;
    /** The swatch (#rrggbb) - a colour binding opens a picker. */
    accentColor?: string;
    /** Up to 4 lines - each rect binds ONE element. */
    bullets?: string[];
    /** Up to 3 rows - each cell binds ONE leaf by path + kind. */
    rows?: PropBindingsRow[];
    /** A number - the numeral binds it. */
    count?: number;
    /** Up to 4 numbers - each tile binds ONE element. */
    scores?: number[];
    /** Up to 4 lines - each rect binds ONE line by character span. */
    code?: string;
    /** A closed set - drawn, but NOT bindable. */
    mode?: "plain" | "boxed";
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** `[start, end)` spans of each line in the RAW string, plus its first token. */
export declare function lineSpans(code: string): Array<{
    line: string;
    range: {
        start: number;
        end: number;
    };
    focus: {
        start: number;
        end: number;
    };
}>;
export declare const PropBindingsV1: import("@m0saic/types").MosaicTemplate<PropBindingsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PropBindingsV1;
