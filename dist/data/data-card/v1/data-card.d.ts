/**
 * `@m0saic-starter/data/data-card/v1` — the end of the chain: pixels.
 *
 * ONE CONCEPT: a consumer reads `ctx.upstreamData[alias]` and draws it.
 * Producer, adapter and consumer never mention each other's ids — they agree
 * on an ALIAS and a SHAPE, which is why any of the three can be swapped.
 *
 * DECLARE WHAT YOU READ. `upstreamDataSchema` documents the blocks and keys
 * this template consumes; the resolver checks a chain against it and warns on
 * a mismatch instead of silently drawing zeroes. It is documentation the
 * machine can read — and the only place a consumer's expectations are
 * written down.
 *
 * SELF-EVIDENCING. The card says which alias it read and whether the block
 * arrived. When a chain misbehaves, the picture should tell you where it
 * broke without a debugger — the same reason `props/error-mosaic` renders its
 * complaints instead of throwing them into a log.
 *
 * FALLBACKS ARE PART OF THE DESIGN. `sampleData` renders the card with no
 * chain at all, which is how it earns a preview image and how you lay out the
 * card before any data exists.
 */
export type DataCardProps = {
    /** Which upstream block to draw. */
    alias?: string;
    /** Headline above the values. */
    title?: string;
    /** Draw a built-in sample when nothing upstream arrived. */
    sampleData?: boolean;
};
export declare const DataCardV1: import("@m0saic/types").MosaicTemplate<DataCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default DataCardV1;
