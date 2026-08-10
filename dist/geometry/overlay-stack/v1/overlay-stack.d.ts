/**
 * `@m0saic-starter/geometry/overlay-stack/v1` — an overlay restores the
 * whole canvas and paints ON TOP.
 *
 * ONE CONCEPT: the attached `{...}` block. Attach an overlay to any node
 * and its content gets a FRESH copy of that node's rect to subdivide —
 * layered above, painted after. Three rules to internalize:
 *
 *   1. RESTORE: inside `1{3[-,1,-]}` the overlay's `3[-,1,-]` re-splits the
 *      full tile the `1` occupies — the base's geometry doesn't constrain
 *      the overlay's.
 *   2. PAINT ORDER: base first, then its overlay content — later paints
 *      above. Nesting continues the walk: this template's badge lives on an
 *      overlay INSIDE the band's overlay, so it paints above both.
 *   3. BINDING ORDER: sources[] still bind to rendered frames in walk
 *      order — base, band, badge — exactly the paint order.
 *
 * The string here is `1{3[-,1{1},-]}`: a full-canvas base, a centered
 * horizontal band on its overlay, and a badge on the band's own overlay.
 * Three frames, three sources, three layers of paint.
 */
export type OverlayStackProps = {
    /** Base fill (#rrggbb). */
    baseColor?: string;
    /** Band fill (#rrggbb). */
    bandColor?: string;
};
export declare const OverlayStackV1: import("@m0saic/types").MosaicTemplate<OverlayStackProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default OverlayStackV1;
