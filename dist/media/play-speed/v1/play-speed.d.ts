/**
 * `@m0saic-starter/media/play-speed/v1` — source time vs output time.
 *
 * ONE CONCEPT: `playback.playSpeed`. A speed of 2 plays the source at
 * double rate — every second of OUTPUT consumes TWO seconds of SOURCE.
 * The clip window (`clipDurationMs`) is measured in SOURCE time, so a
 * 2000ms window at playSpeed 2 fills only 1000ms of output; `loopMode`
 * decides what fills the rest.
 *
 * The template deliberately takes a SMALL sample (default 1s of source)
 * instead of the whole file: a short window ends well before the output
 * does, which is the only way `loopMode` becomes visible — loop repeats
 * it, freeze holds its last frame, cut goes black. Point this at a
 * ten-minute movie at 0.25x and you'd never reach the end of the window,
 * so you'd never see the mode do anything.
 */
export type PlaySpeedProps = {
    /** The video to re-time. */
    video?: string;
    /** Playback rate (0.25-4, steps of 0.25). 1 = realtime. */
    speed?: number;
    /** Source-time window length, ms — small on purpose (see loopMode). */
    sampleMs?: number;
    /** What fills the output after the re-timed window runs out. */
    loopMode?: "loop" | "cut" | "freeze";
};
export declare const PlaySpeedV1: import("@m0saic/types").MosaicTemplate<PlaySpeedProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PlaySpeedV1;
