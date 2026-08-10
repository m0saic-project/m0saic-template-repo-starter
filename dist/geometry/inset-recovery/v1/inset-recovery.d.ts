/**
 * `@m0saic-starter/geometry/inset-recovery/v1` — exact pixels that survive
 * nesting.
 *
 * ONE CONCEPT: INSET RECOVERY (`placeInsetPieces`). You want chips at exact
 * pixel rects — but you also want this template to be NESTABLE. Those pull
 * in opposite directions:
 *
 *   - `placeRects` at raw pixels bakes near-canvas precision into the
 *     STRING. Precision is hereditary: a parent that embeds your layout
 *     inherits your floors, so one pixel-precise child quietly makes the
 *     whole composition demand a huge canvas. (This bit alpine hard —
 *     nested card internals kept RAISING the parent's precision floor.)
 *   - `placeInsetPieces` quantizes each chip's CELL outward onto a coarse
 *     divisor lattice (precision bounded by `basis`, default 120), then
 *     hands each source a `placement.inset` that paints it back on the
 *     EXACT input rect. The string stays coarse and composable; the pixels
 *     land byte-exact. Insets are leaf-private fiber — parents never see
 *     them.
 *
 * The card prints the receipts: the same three chips spelled with
 * `placeRects` vs `placeInsetPieces`, and each spelling's measured
 * precision floor. Same pixels — wildly different promises to whoever
 * nests you. This is why nestable production templates reach for inset
 * recovery by default.
 */
export type InsetRecoveryProps = {
    /** Chip fill (#rrggbb). */
    chipColor?: string;
};
export declare const InsetRecoveryV1: import("@m0saic/types").MosaicTemplate<InsetRecoveryProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default InsetRecoveryV1;
