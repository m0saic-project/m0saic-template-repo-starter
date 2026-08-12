/**
 * `@m0saic-starter/basics/color-tiles/v1` — tiles, sources, and the canvas.
 *
 * ONE CONCEPT: how `sources[]` maps onto the m0 layout, plus the two
 * conventions every multi-tile template uses —
 *
 *   - `makeColorTile(color)` is THE way to paint a solid tile. It emits an
 *     ffmpeg `color=` (lavfi) source: essentially free to render, and it
 *     composes with masks/placement/overlay timing without special cases.
 *   - `document.backgroundColor` fills empty canvas. Never burn a "base
 *     layer" tile just to get a background — the document field is cheaper,
 *     and preview and render agree on it.
 *
 * The m0 comes from `weightedSplit`. With `gap` at 0 that's
 * `weightedSplit([1,1,1], "col")` → `3(1,1,1)`: three equal columns, edge
 * to edge. Raise `gap` and NULL cells (`-`) are woven between and around
 * them — a null claims space and paints nothing, so what shows through is
 * the document background. That's the only way to SEE the second
 * convention: a canvas covered by tiles has no empty canvas left.
 *
 * Rendered frames appear in paint order and `sources[i]` fills frame i —
 * but nulls are not frames, so the source list stays exactly one entry per
 * color no matter how wide the gaps get.
 */
export type ColorTilesProps = {
    /** Tile fills, left to right (#rrggbb each). Determines the column count. */
    colors?: string[];
    /** Empty-canvas fill behind everything (#rrggbb). */
    backgroundColor?: string;
    /** Null-cell gap woven around the tiles, in weight units (0 = edge to edge). */
    gap?: number;
};
export declare const ColorTilesV1: import("@m0saic/types").MosaicTemplate<ColorTilesProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ColorTilesV1;
