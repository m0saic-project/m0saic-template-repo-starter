/**
 * `@m0saic-starter/pipelines/ref-mirror/v1` — draw a cell once, show it in
 * several places.
 *
 * ONE CONCEPT: `{ type: "ref", flattenedStableKey }` is a MIRROR of another
 * cell's rendered pixels. The target renders once; every ref reads that same
 * intermediate and decorates its own copy. N mirrors, N decoration chains,
 * ONE decode.
 *
 * The key is a StableKey in the FLATTENED document — `"r"` is the root cell,
 * `"r/fc0"` the first cell of a split, `"r/gcolc4/fc0"` an inner cell of a
 * nested one. It is a coordinate the m0 decides, not a name you invent, so
 * this template ASKS: `findStableKeys(m0, f => f.kind === "frame")` returns
 * them in source order and the hero is the first.
 *
 * Guessing is the trap. This lesson's layout looks like a 5:1 row split, but
 * `weightedSplit` expands it into the run `6[0,0,0,0,2(…),1]` — so the hero
 * sits at `r/gcolc4/fc0`, and a hand-written `"r/fc0"` would resolve to
 * nothing (`MOSAIC_REF_NOT_FOUND`).
 *
 * The decoration is what makes a mirror useful. `placement`, `effects`,
 * `mask`, `visual`, `playback` on the REF apply to that copy only, so the
 * same pixels can be a full-bleed hero in one cell and a contained thumbnail
 * in another.
 *
 * Two limits worth knowing before you reach for it:
 *
 *   - A ref cannot target a `data` source (they occupy no cell) or another
 *     ref (chains are rejected: `MOSAIC_REF_TARGET_NOT_SUPPORTED`).
 *   - For a plain colour, DON'T. `color=` is essentially free, so N lavfi
 *     tiles beat a mirror. Refs pay off against targets with a real
 *     intermediate: media, text-as-image, nested mosaics.
 */
export type RefMirrorProps = {
    /** Word drawn once in the hero cell, then mirrored. */
    word?: string;
    /** How the mirrors fit their cells. */
    mirrorFit?: "contain" | "cover";
};
export declare const RefMirrorV1: import("@m0saic/types").MosaicTemplate<RefMirrorProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RefMirrorV1;
