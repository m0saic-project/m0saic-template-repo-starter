/**
 * `@m0saic-starter/pipelines/ref-across-steps/v1` — reach BACK to a cell an
 * earlier step already rendered.
 *
 * ONE CONCEPT: a ref carries `stepIndex` as well as a key, and that turns it
 * into a back-edge across the pipeline. Step 3 can show step 0's exact
 * pixels without re-rendering them — the engine reuses the earlier step's
 * intermediate.
 *
 * BACK-EDGES ONLY: `stepIndex` must be strictly earlier than the consuming
 * step, and a forward reference is `MOSAIC_REF_FORWARD_REFERENCE`. That is
 * what keeps a pipeline a sequence and not a graph with cycles.
 *
 * WHY IT MATTERS BEYOND PIXEL REUSE. In a long generated sequence — each step
 * producing a scene — consistency is the hard part. A back-edge lets step Y
 * point at a specific cell from step X and get *that* frame back, rather than
 * describing it again and hoping for the same result. The reference is the
 * thing that was actually rendered, so it cannot drift.
 *
 * THE HANDOFF IDIOM. Across steps the consumer usually can't know the
 * producer's stableKeys, so the PRODUCER self-stamps a pointer into its
 * `variables` and the consumer spreads it:
 *
 *   // producer (it owns the geometry, so the key is right by construction):
 *   variables: { hero: { stepIndex: ctx.pipelineStep!.index,
 *                        flattenedStableKey: "r/fc0" } }
 *   // consumer:
 *   sources: [{ type: "ref", ...ctx.upstreamVariables!.hero }]
 *
 * This template publishes that handle even though it also hardcodes the key —
 * a lesson can see both ends at once, which a real pair of templates cannot.
 *
 * The producer step is `intermediate: true`: it renders (the ref needs its
 * pixels) but never ships. At least one step must NOT be intermediate, or the
 * pipeline has no output at all.
 *
 * That also changes the arithmetic. A pipeline must stitch to
 * `ctx.target.durationMs`, and the stitch counts OUTPUT steps only — so with
 * the producer intermediate the consumer carries the whole clip, and shipping
 * the producer makes the two split it.
 */
export type RefAcrossStepsProps = {
    /** Word rendered in the producer step and echoed later. */
    word?: string;
    /** Ship the producer step as its own file too. */
    keepProducer?: boolean;
};
export declare const RefAcrossStepsV1: import("@m0saic/types").MosaicTemplate<RefAcrossStepsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RefAcrossStepsV1;
