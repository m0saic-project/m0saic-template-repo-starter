/**
 * `@m0saic-starter/geometry/ratio-vs-absolute/v1` — a proportion contract
 * over a pixel contract, and you can WATCH them disagree.
 *
 * ONE CONCEPT: RATIO vs ABSOLUTE drafting.
 *
 *   - RATIO (`weightedSplit([1,2,1])`): the string carries PROPORTIONS.
 *     The sides are "a quarter of the canvas" — whatever the canvas is.
 *     Resize and they scale. Nest it in a parent slot and it recomposes.
 *   - ABSOLUTE (`placeRects` at exact pixels): the string carries PIXELS.
 *     The rails below are pinned at `railPx` no matter how wide the canvas
 *     gets — the middle absorbs every extra pixel. That's desktop-chrome
 *     drafting (fixed sidebars, fluid content). The cost: a px-baked
 *     string is only meaningful AT the canvas it was baked for; nested
 *     into a differently-sized slot it quietly degrades. Default to
 *     ratio; pin pixels only at the HEAD (the final, never-nested canvas).
 *
 * The two bands share a canvas so the disagreement is visible: drag the
 * canvas width and the top boundaries MOVE while the bottom rails HOLD.
 * One collision worth knowing: at exactly 4× the rail width a quarter IS
 * the rail (e.g. 960 wide at 240px rails) — both spellings canonicalize
 * to the SAME string. That collision is the lesson in one move: ratio
 * says "a quarter", absolute says "240px", and only sometimes do they
 * mean the same thing.
 */
export type RatioVsAbsoluteProps = {
    /** Pinned width of the absolute band's side rails, in px. */
    railPx?: number;
    /** Fill for the bottom (absolute) band's middle rect (#rrggbb). */
    absoluteColor?: string;
};
export declare const RatioVsAbsoluteV1: import("@m0saic/types").MosaicTemplate<RatioVsAbsoluteProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RatioVsAbsoluteV1;
