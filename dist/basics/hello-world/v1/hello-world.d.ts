/**
 * `@m0saic-starter/basics/hello-world/v1` — the smallest correct template.
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
 * The layout is `F`: one full-canvas rect. One tile → one source → the text.
 * This template is deliberately static, so it never reads `ctx` — the first
 * template that must (sizing off `ctx.target`) is
 * `@m0saic-starter/basics/aspect-adaptive-card/v1`, two lessons from here.
 */
export type HelloWorldProps = {
    /** The line of text in the middle of the canvas. */
    text?: string;
    /** Canvas fill (#rrggbb). */
    backgroundColor?: string;
};
export declare const HelloWorldV1: import("@m0saic/types").MosaicTemplate<HelloWorldProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default HelloWorldV1;
