/**
 * `@m0saic-starter/text/count-up/v1` — a number that ticks, and the three
 * things that have to line up for it to.
 *
 * ONE CONCEPT: `content.kind: "expr"` hands ffmpeg an EXPRESSION instead of a
 * string, and ffmpeg evaluates it while encoding. That is the only way to get
 * text that changes over time — the svg rasterizer bakes glyphs to geometry
 * before the first frame exists, so a baked source can only ever show one
 * value.
 *
 * Three fields have to agree, and getting any one wrong fails QUIETLY:
 *
 *   1. `content: { kind: "expr", expr, eval: "frame" }` — `eval: "frame"`
 *      re-evaluates per frame. Without it ffmpeg evaluates once at init and
 *      draws a constant.
 *   2. `renderMode: { kind: "video" }` — a still is ONE frame, so an
 *      animated counter on an image source freezes at whatever t=0 says
 *      (usually 0). Flip `Freeze as a still` to watch exactly that.
 *   3. No `rasterizer: "svg"` on this source — svg is the baked path.
 *
 * `animateNumbersInText("1200", { durationSec })` writes the expression for
 * you: it finds every number in the string and replaces it with an eased
 * `%{eif:…:d}` ramp from 0 to that number over `durationSec`, leaving the
 * surrounding literal text alone. So "1200 stars" counts the 1200 and keeps
 * the word.
 *
 * The label under the counter is an ordinary svg source — the mix is the
 * lesson: reach for drawtext where you need time, and stay baked everywhere
 * else.
 */
export type CountUpProps = {
    /** The number to count up to. */
    value?: number;
    /** Text after the number (kept literal — only digits animate). */
    suffix?: string;
    /** The static label under the counter. */
    label?: string;
    /** Render as a still: the counter freezes at frame 0 (the trap). */
    freezeAsStill?: boolean;
};
export declare const CountUpV1: import("@m0saic/types").MosaicTemplate<CountUpProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CountUpV1;
