/**
 * `@m0saic-starter/compose/rotate-headroom/v1` — `effects.rotate` spins the
 * content INSIDE the tile, and the tile never grows. Headroom has to be real
 * geometry.
 *
 * ONE CONCEPT: rotation is in-place. The engine emits
 * `rotate=a=…:ow=iw:oh=ih`, so the buffer keeps its exact size: uncovered
 * corners fill transparent, and content corners that leave the buffer are
 * CLIPPED. That is deliberate — a tile that could bleed past its cell would
 * break every downstream placement calculation.
 *
 * Which means the fix for a clipped rotation is never a bigger number
 * somewhere. `placement.inset` and `padding` shrink the box BEFORE the
 * effects chain runs, so they make clipping worse, not better. The only real
 * cure is a bigger buffer:
 *
 *   wrap the card in a CHILD whose declared `size` is the rotated bounding
 *   box, put the rotation on the child, and the card now has margin to
 *   sweep through.
 *
 * The rotated bounding box of a w×h card at angle θ is exactly:
 *
 *   W' = w·|cos θ| + h·|sin θ|      H' = w·|sin θ| + h·|cos θ|
 *
 * Both modes draw the SAME card at the same pixel size — the only difference
 * is how much buffer sits around it. Sweep the angle in each and watch one
 * of them lose its corners.
 */
export type RotateHeadroomProps = {
    /** Rotation in degrees, clockwise. */
    angle?: number;
    /** "in-place": rotate the card itself. "headroom": rotate a padded child. */
    mode?: "in-place" | "headroom";
};
export declare const RotateHeadroomV1: import("@m0saic/types").MosaicTemplate<RotateHeadroomProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RotateHeadroomV1;
