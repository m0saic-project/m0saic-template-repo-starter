/**
 * `@m0saic-starter/pipelines/fan-out/v1` — one render, several deliverables
 * at DIFFERENT shapes.
 *
 * ONE CONCEPT: `emit: "multi"` stops concatenating and writes one file per
 * output step, each at its OWN step canvas. That is the only way to get
 * several geometries out of one template — a document has one m0, therefore
 * one geometry, and no amount of output config changes that.
 *
 * Three rules travel with it:
 *
 *   - EACH STEP IS A FILE, named from `step.name`: `{base}-{name}.{ext}`
 *     (`step-{index}` when unnamed, and two steps may not share a name).
 *   - MULTI IS TOP-LEVEL ONLY. A pipeline nested inside another document's
 *     `children` silently downgrades to `"single"`.
 *   - `intermediate: true` steps render but never ship. They exist to back
 *     ref sources and shared work; at least one step must be non-intermediate
 *     or the pipeline has no output at all.
 *
 * The lesson deliberately re-lays out per shape rather than scaling one
 * canvas: the landscape step stacks its label beside the mark, the portrait
 * step stacks it underneath. Re-layout is the reason to fan out at all — if
 * a plain resize would do, one render plus an `encodes` entry is cheaper
 * (pipelines/encode-matrix).
 */
export type FanOutProps = {
    /** Text on every variant. */
    title?: string;
    /** Also emit a square variant. */
    includeSquare?: boolean;
    /** Length of each variant, ms. */
    variantMs?: number;
};
export declare const FanOutV1: import("@m0saic/types").MosaicTemplate<FanOutProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default FanOutV1;
