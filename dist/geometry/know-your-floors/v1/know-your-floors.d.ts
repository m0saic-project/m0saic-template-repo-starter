/**
 * `@m0saic-starter/geometry/know-your-floors/v1` — a layout has TWO minimum
 * canvases, and both are computable before you render.
 *
 * ONE CONCEPT: the two floors.
 *
 *   - The FEASIBILITY floor ("won't error"): below it some frame would
 *     collapse to zero pixels and the render fails. `computeFeasibility`.
 *   - The PRECISION floor ("looks right"): below it the split's slots can't
 *     each get a whole pixel, so tiles drift from their ideal proportions
 *     (quantization spread). Driven by the largest split count per axis.
 *
 * They're independent, and either can be the binding one — so the real
 * minimum is the per-axis max of both: `evaluateM0(...).recommendedMin`.
 *
 * This template runs `evaluateM0` on ITS OWN demo layout against
 * `ctx.target` and prints the report card: the floors, the recommended
 * minimum, and whether THIS canvas clears each bar. Shrink the canvas and
 * watch the verdicts flip before anything visibly breaks.
 */
export type KnowYourFloorsProps = {
    /** Demo layout to evaluate (any valid m0). Default: a 3-col row over a 7-slot row. */
    m0?: string;
};
export declare const KnowYourFloorsV1: import("@m0saic/types").MosaicTemplate<KnowYourFloorsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default KnowYourFloorsV1;
