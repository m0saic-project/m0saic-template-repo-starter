/**
 * `@m0saic-starter/props/seeded-shuffle/v1` — randomness that renders the
 * same bytes every time.
 *
 * ONE CONCEPT: determinism under randomness. Templates never call
 * `Math.random` — any "random" choice flows from a REQUIRED `seed` prop
 * through a seeded generator (`mulberry32`), so identical props produce a
 * byte-identical document, always. Same seed → same shuffle → same render;
 * change the seed and you get a different (but equally reproducible) deal.
 *
 * The render is a strip of palette tiles shuffled by the seed
 * (Fisher-Yates), with the dealt order printed as the caption receipt.
 */
export type SeededShuffleProps = {
    /** REQUIRED: the shuffle seed (integer 0-2147483647). */
    seed?: number;
    /** How many tiles to deal (4-12). */
    tiles?: number;
};
export declare const SeededShuffleV1: import("@m0saic/types").MosaicTemplate<SeededShuffleProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default SeededShuffleV1;
