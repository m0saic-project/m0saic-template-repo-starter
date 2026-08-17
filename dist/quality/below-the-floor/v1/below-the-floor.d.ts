/**
 * `@m0saic-starter/quality/below-the-floor/v1` — the two floors, and which
 * one you fell through.
 *
 * ONE CONCEPT: a layout has TWO independent minimum sizes, and missing them
 * fails in two completely different ways.
 *
 *   FEASIBILITY  will it render AT ALL?  Below it a split produces a 0-size
 *                frame and the engine refuses: SPLIT_EXCEEDS_AXIS. LOUD.
 *
 *   PRECISION    will it look RIGHT?     Below it every cell can no longer
 *                get its own pixel, so cells squash, spread, or vanish. It
 *                renders. Exit code 0. SILENT.
 *
 * The silent one is why this template exists. "It rendered" is not "it is
 * correct", and the gap between those two statements is a number you can
 * compute before drawing a single pixel.
 *
 * NEITHER FLOOR IS A FLOOR ON THE OTHER. They cross both ways: donation-heavy
 * layouts (like this one) sit far below their precision floor, while
 * deeply-nested same-axis layouts are the reverse. The number you actually
 * want is the FOLDED floor — the per-axis max of the two, which
 * `evaluateM0` reports as `recommendedMin`.
 *
 * ONE DESIGN, THREE STATES. Every mode draws the SAME three bands at the same
 * 10/10/80 proportions. Only the GRANULARITY changes — the same shape
 * expressed over more slots:
 *
 *   weightedSplit([S, S, 8S], "col", { mode: "literal" })
 *
 * `mode: "literal"` is load-bearing: the default reduces weights by their GCD,
 * which would collapse `[140,140,1120]` straight back to `[1,1,8]` and undo
 * the whole demonstration. Raising S leaves the picture identical and walks
 * the floors up past the canvas — precision first (it grows as 10·S), then
 * feasibility (roughly 4·S, since passthroughs donate and only the claimants
 * need their own pixel).
 *
 * The caption prints all three numbers at your actual canvas, so the two
 * failure modes are told apart by arithmetic instead of by squinting.
 *
 * DON'T GUESS — MEASURE. Every S here is derived from `ctx.target` and then
 * CHECKED with `evaluateM0` before rendering. The state is a property of
 * (design, canvas) together, never of the design alone: resize the canvas and
 * the same m0 changes state.
 */
export type BelowTheFloorMode = "fits" | "under-precision" | "unrenderable";
export type BelowTheFloorProps = {
    /** Which floor to sit above, or fall through. */
    mode?: BelowTheFloorMode;
    /** Band fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const BelowTheFloorV1: import("@m0saic/types").MosaicTemplate<BelowTheFloorProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default BelowTheFloorV1;
