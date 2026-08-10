/**
 * `@m0saic-starter/text/text-three-ways/v1` — the same word, three text
 * pipelines. All valid; different promises.
 *
 * ONE CONCEPT: m0saic has THREE ways to put glyphs on screen, and choosing
 * is an engineering decision:
 *
 *   1. DRAWTEXT (the default `type:"text"` path): ffmpeg's text filter,
 *      rendered at encode time with the HOST's font. The only path that can
 *      run EXPRESSIONS — `content.kind:"expr"` counters, `xExpr`/`yExpr`
 *      motion — because ffmpeg evaluates them per frame. This column
 *      carries a second, expr layer (a % count-up over the clip) to prove
 *      it: `animateNumbersInText` compiles "100%" into a drawtext
 *      `%{eif:...}` expansion, `eval:"frame"` + `renderMode:"video"` make
 *      it re-evaluate every frame. Trade-off: host fonts vary, nothing
 *      wraps, and preview/render can disagree.
 *   2. SVG RASTERIZER (`rasterizer:"svg"`): glyph outlines from the BUNDLED
 *      deterministic font, baked to a masked color tile — pure geometry.
 *      Identical in app preview and CLI, fast (no drawtext spawn), fit it
 *      with measureText. Static literals only.
 *   3. MASK-CARVED (`textToPath` → inline-mask): the text becomes the MASK
 *      of an ordinary source. The most powerful: because the glyphs are
 *      just a mask, ANY source can wear them — a color, a gradient, video
 *      playing through the letters. Also the most manual (you own the
 *      design canvas and the sizing).
 *
 * Three columns render the same word through each pipeline. Select each
 * tile: the first two are `text` sources whose new `rasterizer` row reads
 * drawtext vs svg; the third is a `lavfi` color tile whose MASK section
 * carries the glyph paths.
 */
export type TextThreeWaysProps = {
    /** The word rendered three ways (ASCII, 1-12 chars). */
    word?: string;
    /** Ink color (#rrggbb). */
    inkColor?: string;
};
export declare const TextThreeWaysV1: import("@m0saic/types").MosaicTemplate<TextThreeWaysProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default TextThreeWaysV1;
