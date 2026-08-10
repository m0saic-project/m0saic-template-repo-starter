/**
 * `@m0saic-starter/basics/hello-world/v1` — the smallest correct template,
 * wearing the brand.
 *
 * ONE CONCEPT: the anatomy of a m0saic template. Everything else in this
 * repo is a variation on the five parts you see here:
 *
 *   1. A typed props surface (`definePropsSchema`) where every optional prop
 *      has a deterministic default — same inputs, same output, always.
 *   2. An id, minted with `asTemplateId`, that encodes repo/pack/slug/version.
 *   3. `outputHints` — the SUGGESTED canvas. The host may render any size;
 *      hints are what the app preselects, not a promise you can rely on.
 *   4. A `render(props, ctx)` that returns a `MosaicDocument`: an `m0` layout
 *      string plus `sources[]` that fill its tiles in order.
 *   5. The m0 string branded through `toM0String(...)` — it canonicalizes
 *      and VALIDATES, throwing on a malformed string instead of failing
 *      later, mysteriously, at render time.
 *
 * This is the repo's smoke render, so it says hello the way the brand
 * does: the pixel-M (a color tile wearing the baked glyph as an
 * inline-mask — see geometry/mask-in-a-cell for why any source can wear
 * a mask) over the greeting. The M's cell must be SQUARE — mask bounds
 * scale onto their cell per axis, so a stretched cell would smear the
 * glyph — and "square" is a pixel fact the canvas decides. That is why
 * even hello world reads `ctx.target` and places its three rects with one
 * `placeInsetPieces` call: exact pixels, coarse string, the same layout
 * doctrine the whole curriculum runs on.
 *
 * (Trivia the test locks in: the simplest possible m0 is one full-canvas
 * rect, spelled `F` — and `toM0String("F")` canonicalizes it to `"1"`.)
 */
export type HelloWorldProps = {
    /** The greeting under the M. */
    text?: string;
    /** Canvas fill (#rrggbb). */
    backgroundColor?: string;
};
export declare const HelloWorldV1: import("@m0saic/types").MosaicTemplate<HelloWorldProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default HelloWorldV1;
