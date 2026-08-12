/**
 * `@m0saic-starter/text/carved-type/v1` — the word is the MASK; the picture
 * plays through it.
 *
 * ONE CONCEPT: `textToPath` turns a string into an SVG path, and a path is
 * exactly what an `inline-mask` wants. So text stops being a kind of source
 * and becomes a SHAPE that any source can wear — a color today, a photo or a
 * video tomorrow, with nothing about the source changing except the mask
 * hanging off it.
 *
 * That is the whole trick, and it is why this pipeline is the most powerful
 * of the three (see text/text-three-ways for the map): drawtext and the svg
 * rasterizer both decide the pixels INSIDE the glyphs. A mask decides only
 * the silhouette, and leaves the pixels to whatever is underneath.
 *
 * Two rules carry over from geometry/mask-in-a-cell, and both bite here:
 *
 *   - The mask's `bounds` scale onto the tile PER AXIS. Author the path
 *     against the tile's own box (this template computes it from ctx.target
 *     and its own split) or the letters stretch.
 *   - `fit: "cover"` on the media, not "contain". Contain letterboxes, and
 *     letterboxed bars inside a glyph are just holes in your word.
 *
 * With no file picked the same mask rides a plain color tile — the lesson
 * works with zero setup, and proves the mask is independent of what wears it.
 */
export type CarvedTypeProps = {
    /** The word to carve (ASCII, 1-10 chars). */
    word?: string;
    /** Image or video to play through the letters. Empty = a flat color. */
    media?: string;
    /** Fill used when no media is picked (#rrggbb). */
    fallbackColor?: string;
};
export declare const CarvedTypeV1: import("@m0saic/types").MosaicTemplate<CarvedTypeProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CarvedTypeV1;
