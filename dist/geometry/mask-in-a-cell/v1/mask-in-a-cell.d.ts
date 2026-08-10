/**
 * `@m0saic-starter/geometry/mask-in-a-cell/v1` — shapes are masked COLOR
 * TILES in ratio cells, and the mask's bounds are a design space.
 *
 * ONE CONCEPT: a non-rectangular shape is not a special source — it's an
 * ordinary color tile with an inline SVG-path mask, living in an ordinary
 * ratio cell. The engine scales the mask's `bounds` box onto the cell:
 *
 *   scaleX = cellWidth / bounds.width;  scaleY = cellHeight / bounds.height
 *
 * The axes scale INDEPENDENTLY — and that's the silent failure mode this
 * template makes visible: author a shape against square bounds, drop it in
 * a non-square cell, and it smears. No error, no warning, just a stretched
 * shape. The fix is to make the BOUNDS match the CELL's aspect (compute the
 * cell box from ctx.target + your own weights, then draw the path inside
 * bounds of that shape). Flip `matchAspect` to see both.
 *
 * This is the launder-ladder rung that replaces "mask the whole canvas":
 * masks are leaf-private (fiber) — the cell's geometry stays a cheap ratio
 * split, and the shape costs zero DSL.
 */
export type MaskInACellProps = {
    /** true: bounds match the cell's aspect (correct). false: square bounds in a non-square cell (the smear). */
    matchAspect?: boolean;
    /** Shape fill (#rrggbb). */
    shapeColor?: string;
};
export declare const MaskInACellV1: import("@m0saic/types").MosaicTemplate<MaskInACellProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default MaskInACellV1;
