/**
 * `@m0saic-starter/masks/shape-masks/v1` — the everyday shapes, and the
 * three lines of path math behind each.
 *
 * ONE CONCEPT: m0saic has no shape primitives, and does not need any. Every
 * shape is the same move — a color tile plus an `inline-mask` whose
 * `localPath` is an SVG path — so "add a circle" is a function that returns
 * a string, not a feature request.
 *
 * The four here are the whole everyday vocabulary:
 *
 *   - CIRCLE — two half-arcs, radius from the SHORT side so it stays round
 *     in a rectangle: `M cx-r cy A r r 0 1 1 cx+r cy A r r 0 1 1 cx-r cy Z`.
 *   - ELLIPSE — the same path with rx ≠ ry. Deliberately box-shaped: this is
 *     the one case where filling a non-square cell is the point.
 *   - ROUNDED RECT — `roundedRectPathD(x, y, w, h, r)` from template-utils.
 *     Corners are the fiddly arithmetic; the helper owns it.
 *   - PILL — NOT a fifth shape. It is a rounded rect whose radius is half
 *     the short side; the helper clamps anything larger, so asking for an
 *     impossible radius gives you a pill for free.
 *
 * All four are authored against the CELL's box (`bounds` = the cell), which
 * is what keeps them un-smeared — see geometry/mask-in-a-cell for what
 * happens when they aren't.
 */
export type ShapeMasksProps = {
    /** Which shape to carve. */
    shape?: "circle" | "ellipse" | "rounded-rect" | "pill";
    /** Corner radius for "rounded-rect", as a percent of the short side (0-50). */
    cornerPct?: number;
    /** Shape fill (#rrggbb). */
    shapeColor?: string;
};
export declare const ShapeMasksV1: import("@m0saic/types").MosaicTemplate<ShapeMasksProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ShapeMasksV1;
