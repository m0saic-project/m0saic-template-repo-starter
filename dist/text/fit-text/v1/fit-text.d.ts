/**
 * `@m0saic-starter/text/fit-text/v1` — nothing soft-wraps. Fitting is YOUR
 * job, and it is a measurement, not a guess.
 *
 * ONE CONCEPT: a text source draws exactly the glyphs you hand it, at
 * exactly the size you name, on a canvas that will not reflow. There is no
 * CSS box here — no auto-wrap, no ellipsis, no shrink-to-fit. Copy that is
 * too wide for its tile is CLIPPED, silently.
 *
 * The cure is to measure before you commit. `measureText` runs the BUNDLED
 * font's real glyph metrics (the same file the svg rasterizer draws with),
 * so the helpers built on it are exact rather than heuristic:
 *
 *   - `wrapMeasured(text, fontSize, maxWidthPx)` — greedy word-wrap at a
 *     KNOWN size; returns the lines.
 *   - `fitSvgText(text, boxW, boxH, { maxPx, maxLines })` — binary-searches
 *     the largest size (12..maxPx) whose wrapped block fits BOTH axes.
 *   - `fitSvgLines` / `fitSvgParagraphs` — same search when the line breaks
 *     are yours to keep.
 *
 * Three modes on one box, so the trade is visible: fit the block (wraps,
 * stays big), force one line (fits, goes small), or skip fitting entirely
 * (stays big, gets clipped). Narrow the box and watch each mode react.
 *
 * The caption prints the receipts — chosen size, line count, measured width
 * against the box — because "it looked fine on my canvas" is how clipped
 * copy ships.
 */
export type FitTextProps = {
    /** The copy to fit. */
    copy?: string;
    /** How to fit it: wrap the block, force one line, or don't fit at all. */
    mode?: "fit-block" | "one-line" | "unfitted";
    /** Box width as a percent of the canvas (40-100, steps of 10). */
    boxWidthPct?: number;
};
export declare const FitTextV1: import("@m0saic/types").MosaicTemplate<FitTextProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default FitTextV1;
