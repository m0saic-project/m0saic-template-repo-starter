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
export declare const DECLARED_UNBOUND_DEFAULTS: {
    readonly label: "declared unbound";
    readonly columns: 6;
    readonly gap: 1;
    readonly seed: 7;
    readonly padding: 6;
    readonly accent: "#ee7525";
    readonly pageColor: "#1c2833";
};
/** `n` tints of one colour, darkest first — mixed toward white. */
export declare function tintsOf(hex: string, n: number): string[];
/** The order the tints are dealt in — Fisher-Yates over a seeded generator. */
export declare function dealOrder(seed: number, n: number): number[];
export declare const DeclaredUnboundV1: import("@m0saic/types").MosaicTemplate<DeclaredUnboundProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default DeclaredUnboundV1;
