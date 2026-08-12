/**
 * `@m0saic-starter/masks/path-mask/v1` — holes, drawing direction, and the
 * translucent body. The three things a hand-authored mask path can do that
 * a single shape can't.
 *
 * ONE CONCEPT: a mask's `localPath` is a full SVG path, so it can hold MANY
 * shapes — and when one sits inside another, what happens in the middle is
 * decided by the DIRECTION each one was drawn in, not by anything you get to
 * declare.
 *
 * A path is a pen stroke, and every loop goes round one way or the other.
 * To decide whether a spot is inside the shape or a hole, the renderer
 * stands on that spot and counts the loops wrapping around it: clockwise
 * counts +1, counter-clockwise counts −1. Total zero → hole. Anything else →
 * filled. (SVG calls this the NONZERO fill rule, and it is what the engine
 * gets: the mask rasterizes as `<path d="…" fill="white"/>` with no
 * `fill-rule` attribute, so the default applies.)
 *
 * So a donut is two circles drawn in OPPOSITE directions — the middle is
 * +1 from the outer and −1 from the inner, which cancels to zero. Draw them
 * the SAME way and the middle counts +2: not zero, so it fills in and you
 * have a disc. Nothing errors; you just don't get your hole.
 *
 * The thing to carry away: you never tell the renderer "put a hole here".
 * You tell it "draw this one backwards", and the hole is the consequence.
 * (Verified against the engine's own rasterizer rather than inferred:
 * opposite directions leave the centre transparent, matching directions
 * paint it solid.)
 *
 * `matte` is the other knob. By default everything outside the path is
 * clipped to nothing; `matte: 0..1` renders the whole `bounds` box at that
 * alpha UNDERNEATH the path, which stays fully opaque. One tile then carries
 * a translucent wash plus crisp opaque marks — how a wireframe draws a
 * filled rect with sharp borders in a single source.
 *
 * ⚠️ Check a matte in MOTION, not in a still: at the time of writing, a
 * single-frame render composites onto a transparent base and drops alpha at
 * encode time, so a partial matte arrives at full strength there while a
 * video render blends it correctly. The hole half of this lesson is
 * unaffected either way.
 *
 * The budget: paths carry up to MASK_SUBPATH_BUDGET (260) subpaths. Past
 * that, split the drawing across sources.
 */
export type PathMaskProps = {
    /** Which way round the inner circle is drawn — "opposite" is what makes the hole. */
    innerWinding?: "opposite" | "same";
    /** Alpha for the area OUTSIDE the path (0 = clipped, the default). */
    matte?: number;
    /** Ink for the tile the mask clips (#rrggbb). */
    inkColor?: string;
};
export declare const PathMaskV1: import("@m0saic/types").MosaicTemplate<PathMaskProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PathMaskV1;
