/**
 * `@m0saic-starter/geometry/predict-the-pixels/v1` — quantization is
 * arithmetic, not luck.
 *
 * ONE CONCEPT: the OUTSIDE-IN REMAINDER RULE. An equal split of N tiles on
 * an axis of T pixels gives every tile `floor(T/N)`, then hands the
 * remainder out one pixel at a time in index order 0, N-1, 1, N-2, … —
 * edges first, center last. It's exact and locked by test in the engine,
 * which means a template can compute its own tile widths BEFORE rendering.
 *
 * That's what this template does: each tile is labeled with the width the
 * rule predicts for it. Render at any canvas — the labels are always right.
 * Try 4 tiles at a 103px-wide canvas: `[26, 26, 25, 26]` — edges get the
 * spare pixels, the center absorbs the deficit.
 *
 * The layout trick worth stealing: the LESSON string stays pure
 * (`4(1,1,1,1)`), and the labels ride an attached overlay that mirrors the
 * same split — `4(1,1,1,1){4(1,1,1,1)}`. Base paints fills, overlay paints
 * text, geometry stays identical by construction.
 */
export type PredictThePixelsProps = {
    /** How many equal tiles to split into (2-12). */
    tileCount?: number;
};
export declare const PredictThePixelsV1: import("@m0saic/types").MosaicTemplate<PredictThePixelsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PredictThePixelsV1;
