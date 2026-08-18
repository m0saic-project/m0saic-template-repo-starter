/**
 * `@m0saic-starter/media/time-range-clip/v1` — a scrubbed window into a
 * video.
 *
 * ONE CONCEPT: the time-range picker pair. Declare TWO number props whose
 * names share a prefix and end in `StartMs` / `EndMs` (here `clipStartMs`
 * and `clipEndMs`), put `picker: "time-range"` on BOTH,
 * and point `control.videoFromProp` at the sibling media prop — the
 * editor matches the pair by name suffix and renders ONE video scrubber
 * with start/end handles. On the wire they stay two flat numbers.
 *
 * The window lands on the source as `playback.clipStartMs` +
 * `clipDurationMs` (start + LENGTH, not start + end), with
 * `loopMode: "loop"` filling whatever output time remains.
 *
 * Two satellites this lesson declares nothing for, but you should know
 * exist on `picker: "time-range"` props: `targetDurationMsFromProp` names a
 * sibling prop holding the intended render duration, and the picker then
 * overlays a target band so the user can aim their selection at the render
 * envelope; `markersProvider` (today: `kind: "subtitles"`, resolved from a
 * sibling video prop) draws semantic tick marks above the scrubber. Both
 * need richer fixtures than this lesson ships — declare them when your
 * template has a duration prop or subtitle-bearing sources.
 */
export type TimeRangeClipProps = {
    /** The video to window. */
    video?: string;
    /** Window start, ms into the source. */
    clipStartMs?: number;
    /** Window end, ms into the source. */
    clipEndMs?: number;
};
export declare const TimeRangeClipV1: import("@m0saic/types").MosaicTemplate<TimeRangeClipProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default TimeRangeClipV1;
