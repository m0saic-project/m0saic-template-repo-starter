/**
 * `@m0saic-starter/basics/aspect-adaptive-card/v1` — size off `ctx.target`.
 *
 * ONE CONCEPT: `ctx.target` is the single source of truth for the canvas a
 * render fills — `{width, height, fps, durationMs}`. Branch on it and one
 * template serves every aspect: landscape lays the two panels side by side,
 * portrait stacks them. The caption on the card prints the decision live
 * (`1280×720 → columns`) so you can watch the branch flip as you resize.
 *
 * The rule that bites (worth memorizing):
 *
 *   SIZE OFF `ctx.target`, NEVER `ctx.output`.
 *
 * They often agree — until this template renders NESTED inside another
 * document. Then `ctx.target` carries the SLOT the parent gave you, while
 * `ctx.output` still describes the final deliverable. A nested template that
 * reads `ctx.output` builds geometry for the whole video inside a tile a
 * fraction of that size — the classic silent 5× bug.
 *
 * Second lesson, learned the moment any text overflows: NOTHING SOFT-WRAPS,
 * and different hosts draw fallback fonts differently. So static text here
 * uses `rasterizer: "svg"` — glyphs from the BUNDLED deterministic font,
 * baked to geometry, identical in the app preview and the CLI — and the copy
 * is fitted with `measureText` against that SAME font: greedy word-wrap,
 * largest font whose wrapped block fits the panel box. The full fitting
 * story gets its own lesson later in the curriculum (`text/fit-text`).
 */
export type AspectAdaptiveCardProps = {
    /** Headline, accent panel. */
    title?: string;
    /** Supporting line, body panel. */
    body?: string;
    /** Accent panel fill (#rrggbb). */
    accentColor?: string;
    /** Body panel fill (#rrggbb). */
    panelColor?: string;
};
/**
 * Greedy word-wrap measured against the bundled font: each line takes words
 * while it still fits `maxWidthPx` at `fontSize`. Never breaks a word (a
 * single over-long word gets its own line and the caller's size search
 * shrinks until it fits).
 */
export declare function wrapMeasured(text: string, fontSize: number, maxWidthPx: number): string[];
/**
 * Fit `text` into a `boxW`×`boxH` pixel box: binary-search the largest font
 * size (12..maxPx) whose measured, wrapped block fits both axes. The width
 * budget is deliberately generous (~28% total side margin): breathing room
 * is good typography on desktop canvases, and it keeps the block safe even
 * on hosts whose preview font runs wider than the bundled render font.
 * Returns the "\n"-joined block ready for one svg layer.
 */
export declare function fitSvgText(text: string, boxW: number, boxH: number, opts: {
    maxPx: number;
    maxLines: number;
    widthFrac?: number;
}): {
    text: string;
    fontSize: number;
    lineCount: number;
};
export declare const AspectAdaptiveCardV1: import("@m0saic/types").MosaicTemplate<AspectAdaptiveCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default AspectAdaptiveCardV1;
