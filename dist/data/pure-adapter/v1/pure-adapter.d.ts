/**
 * `@m0saic-starter/data/pure-adapter/v1` — the middle link.
 *
 * ONE CONCEPT: an adapter reads one data block and publishes another. It is a
 * pure function between channels: `ctx.upstreamData[inputAlias]` in, a new
 * `type: "data"` source out, nothing else touched.
 *
 * WHY SPLIT FETCH FROM SHAPE. Fetching needs a capability tier and a network;
 * reshaping needs neither. Keeping them apart means the adapter stays
 * CORE TIER — no permission prompt, no secrets, testable with a plain object
 * — and one fetcher can feed many adapters, or one adapter can sit under
 * several fetchers that all speak the same shape.
 *
 * PURE MEANS PURE. Same input, same output, always: no clock, no randomness,
 * no fs. That is what makes a data chain reproducible, and it is why
 * `ctx` hands you no `Date.now()` equivalent to reach for.
 *
 * DEGRADE, DON'T THROW. A missing upstream block is the normal state while
 * someone is still wiring a chain (and in the editor, where nothing upstream
 * has run). Publish an empty-but-well-shaped result and SAY SO on the tile —
 * a template that throws here is unusable in the editor.
 */
export type PureAdapterProps = {
    /** Channel this adapter reads. */
    inputAlias?: string;
    /** Channel this adapter publishes. */
    outputAlias?: string;
    /** Key inside the input block holding the numbers. */
    seriesKey?: string;
};
/** The derived shape this adapter promises downstream. */
export type SeriesStats = {
    count: number;
    min: number;
    max: number;
    mean: number;
    total: number;
};
/** The whole adapter: numbers in, stats out. Deterministic, dependency-free. */
export declare function summarize(series: readonly number[]): SeriesStats;
export declare const PureAdapterV1: import("@m0saic/types").MosaicTemplate<PureAdapterProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PureAdapterV1;
