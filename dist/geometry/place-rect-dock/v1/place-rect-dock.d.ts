/**
 * `@m0saic-starter/geometry/place-rect-dock/v1` — one exact rectangle,
 * exactly where you said.
 *
 * ONE CONCEPT: `placeRect` places ONE pixel-exact rect inside a canvas —
 * x/y or alignment, exact width/height — and emits an m0 whose margins are
 * null tiles (they claim space and paint nothing, so nothing quantizes
 * INTO your rect). This is the tool for docking a logo, a badge, a
 * watermark: one rendered frame, everything else is air.
 *
 * The caveat that keeps it honest: placeRect is a HEAD-ONLY move. The
 * emitted string encodes THIS canvas's pixels (`rootW`/`rootH` are baked
 * into the split weights), so it belongs on the final, never-nested canvas.
 * Rerender at another size and this template re-bakes a different string —
 * the caption prints the numbers so you can watch it happen.
 */
export type PlaceRectDockProps = {
    /** Dock width as a fraction of canvas width (0.1-0.5). */
    widthFrac?: number;
    /** Dock height as a fraction of canvas height (0.06-0.4). */
    heightFrac?: number;
    /** Margin from the bottom-right corner, px (0-128). */
    marginPx?: number;
    /** Dock fill (#rrggbb). */
    dockColor?: string;
};
export declare const PlaceRectDockV1: import("@m0saic/types").MosaicTemplate<PlaceRectDockProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PlaceRectDockV1;
