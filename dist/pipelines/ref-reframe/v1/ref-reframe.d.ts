/**
 * `@m0saic-starter/pipelines/ref-reframe/v1` — the same mirror, worn
 * differently.
 *
 * ONE CONCEPT: a ref does not have to match its target. When the mirror's
 * slot differs in SIZE, ASPECT, FPS or DURATION, the engine bridges the gap
 * and the ref's own decoration decides how:
 *
 *   - SHAPE — `placement.fit` (`contain` letterboxes, `cover` crops) plus
 *     alignment. The mirrored pixels are the same; the framing is yours.
 *   - TIME — `playback.loopMode`: `loop` repeats the target, `freeze` holds
 *     its last frame, `cut` goes black once it runs out. Plus
 *     `clipStartMs` / `clipDurationMs` to take a window of it.
 *
 * This is the case the matrix in the knowledge base calls 3c: cross-step,
 * different duration. The consumer step here is deliberately LONGER than the
 * producer, so the tail is real and `loopMode` is the only thing deciding
 * what fills it — exactly like media/play-speed, but for mirrored pixels.
 *
 * The pixels are never re-rendered. One decode, one intermediate, and every
 * consumer's decoration chain runs independently on top.
 */
export type RefReframeProps = {
    /** How the mirror frames a differently-shaped slot. */
    fit?: "contain" | "cover";
    /** What fills the tail when the mirror outlives its target. */
    loopMode?: "loop" | "freeze" | "cut";
    /** How much longer the consumer step runs, in ms. */
    tailMs?: number;
};
export declare const RefReframeV1: import("@m0saic/types").MosaicTemplate<RefReframeProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RefReframeV1;
