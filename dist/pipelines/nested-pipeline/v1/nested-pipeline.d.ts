/**
 * `@m0saic-starter/pipelines/nested-pipeline/v1` — time inside a tile.
 *
 * ONE CONCEPT: a `children` entry may be a PIPELINE, not just a document. It
 * renders first, and the parent consumes its stitched output as the tile's
 * content — scene-within-scene without putting time into the m0.
 *
 * Three rules govern the nesting, and each one is a trap if you meet it by
 * surprise:
 *
 *   - THE SLOT'S DURATION WINS. The nested pipeline must fill the parent
 *     slot's effective duration T. The engine sums its steps, trims the last
 *     one to fit, and — when the pipeline is SHORTER than T — falls back to
 *     the embedding source's `playback.loopMode` (loop / freeze / cut).
 *   - THE PARENT'S CANVAS WINS. Per-step canvases are overridden under
 *     nesting (`PIPELINE_NESTED_CANVAS_COLLAPSED`), so a nested step cannot
 *     keep its own shape.
 *   - `emit: "multi"` SILENTLY DOWNGRADES to "single". Multi is a top-level
 *     concept; there is no such thing as a nested fan-out.
 *
 * THE STAMP HAZARD: a nested pipeline should declare its own `size`, `fps`
 * and `durationMs` rather than inheriting whatever the parent's render
 * happened to stamp. A pipeline that leaves them undefined is at the mercy of
 * the slot it lands in — fine while it renders standalone, surprising the
 * first time it is embedded.
 */
export type NestedPipelineProps = {
    /** How long the inner pipeline runs, in ms — shorter than the slot on purpose. */
    innerMs?: number;
    /** What fills the slot when the inner pipeline is shorter. */
    loopMode?: "loop" | "freeze" | "cut";
};
export declare const NestedPipelineV1: import("@m0saic/types").MosaicTemplate<NestedPipelineProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NestedPipelineV1;
