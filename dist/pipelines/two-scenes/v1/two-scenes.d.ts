/**
 * `@m0saic-starter/pipelines/two-scenes/v1` — the smallest pipeline: two
 * documents, one file.
 *
 * ONE CONCEPT: a template may return a `MosaicDocumentPipeline` instead of a
 * document. A pipeline is a SEQUENCE of documents, each with its own m0, its
 * own sources, and its own `durationMs` — because one document means one
 * geometry, and time is the thing a single m0 cannot express.
 *
 * `emit: "single"` (the default) renders every step and concatenates them
 * into ONE file. `emit: "multi"` writes one file per step — that is
 * pipelines/fan-out, next door.
 *
 * THE OVERLAP RULE is the part that surprises people. A transition of
 * `durationMs` d does not sit BETWEEN the steps; it overlaps the last d of
 * the earlier step with the first d of the later one. So the stitched output
 * is:
 *
 *   A + B − d      (not A + B)
 *
 * Which is why the scene lengths are DERIVED, not chosen: a pipeline must
 * stitch to `ctx.target.durationMs`, so each scene carries half the overlap
 * on top of its visible time. Time comes from ctx.target exactly the way
 * size does — pick your own numbers and the render comes out short.
 *
 * Steps rendered at DIFFERENT canvas sizes fall back to a hard cut with a
 * diagnostic — xfade needs matching dimensions. Every step here shares the
 * pipeline's canvas, which is the ordinary case.
 */
export type TwoScenesProps = {
    /** How the two scenes meet. */
    transition?: "cut" | "fade";
    /** Overlap length in ms — the amount the stitched output LOSES. */
    transitionMs?: number;
};
export declare const TwoScenesV1: import("@m0saic/types").MosaicTemplate<TwoScenesProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default TwoScenesV1;
