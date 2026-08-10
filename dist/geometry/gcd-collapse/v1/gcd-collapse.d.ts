/**
 * `@m0saic-starter/geometry/gcd-collapse/v1` — identical proportions,
 * fraction of the string.
 *
 * ONE CONCEPT: GCD-COLLAPSE the weights. `[25, 50, 25]` and `[1, 2, 1]` are
 * the SAME proportions — dividing by the greatest common divisor changes
 * nothing visually, but the collapsed split has 4 slots instead of 100.
 * Fewer slots = shorter DSL, more pixels per weight unit (the ≥4 px/weight
 * rule of thumb), and a lower precision floor.
 *
 * The two rows spell the same proportions:
 *
 *   top     weightedSplit([25,50,25], "col", { mode: "literal" })   100 slots
 *   bottom  weightedSplit([25,50,25], "col")                          4 slots
 *
 * At a friendly canvas (width divisible by both) they render identically.
 * At a HOSTILE width, watch the seams: the 100-slot row's boundaries drift
 * visibly while the 4-slot row stays tight — quantization spread grows with
 * slot count (each slot needs its whole-pixel share; the ≥4 px-per-weight
 * rule of thumb exists exactly for this). Each row's label prints its slot
 * count, its DSL length, and its MEASURED spread at this very canvas.
 *
 * `"optimized"` is the DEFAULT mode — the builder GCD-collapses for you.
 * `"literal"` exists for byte-stable legacy strings; reaching for it is
 * almost always the wrong instinct.
 */
export type GcdCollapseProps = {
    /** The shared weights, before collapse. */
    weights?: number[];
};
export declare const GcdCollapseV1: import("@m0saic/types").MosaicTemplate<GcdCollapseProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default GcdCollapseV1;
