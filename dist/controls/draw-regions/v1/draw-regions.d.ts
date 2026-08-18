/**
 * `@m0saic-starter/controls/draw-regions/v1` — the user marks an area on
 * the LIVE PREVIEW, and the template receives geometry.
 *
 * ONE CONCEPT: `picker: "regions"`. The handshake is the product: a
 * template declares that it wants AREAS, and the preferred UX for handing
 * over geometry is drawing against the live preview — the user interacts
 * with the picture naturally, marking the thing they mean. The wire is a
 * plain `MosaicRegionsValue` (`{ canvas?, regions: [{x, y, w, h}, …] }`,
 * integer px in the authored canvas), so the same value also arrives from
 * `--props` JSON, an agent, or a saved file.
 *
 * WHAT THE TEMPLATE DOES WITH THE AREAS IS ITS OWN CONCERN. The production
 * first-adopter blurs them; a redaction template would black them out; an
 * AI-driven template would treat them as target bounding boxes for its own
 * work. This class of templates — local, visual user feedback flowing into
 * arbitrary downstream behavior — is exactly what the regions contract
 * exists to enable. This lesson keeps its concern honest and minimal: it
 * SHOWS the handshake, marking each received region on a stand-in scene
 * with an index chip, in the order the user drew them (order is intent and
 * is preserved on the wire).
 *
 * Consumption discipline, straight from the contract:
 *  - `parseRegionsValue` at the boundary (tolerant: wrapper object, bare
 *    array, JSON string, numeric strings — all legal arrivals);
 *  - `resolveRegionsToPx` against YOUR target canvas (rescales
 *    authored-canvas coordinates, clamps, per-region verdicts — degrade a
 *    bad region, keep the batch);
 *  - ZERO regions is the working BASE CASE, not an error — the scene
 *    renders with an invitation to draw.
 *
 * Geometry note: resolved px land on a quarter-resolution grid before
 * `placeRects`, deliberately — full-px placement would bake the render
 * width into the precision floor (the design-pixels trap from the
 * options/floors lessons); /4 keeps the safe minimum a quarter of it.
 */
export type DrawRegionsProps = {
    /** The marked areas — drawn on the preview, or hand-authored JSON. */
    regions?: unknown;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Default marked areas — two rects over the stand-in scene. */
export declare const DEFAULT_REGIONS: {
    canvas: {
        w: number;
        h: number;
    };
    regions: {
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
};
export declare const DrawRegionsV1: import("@m0saic/types").MosaicTemplate<DrawRegionsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default DrawRegionsV1;
