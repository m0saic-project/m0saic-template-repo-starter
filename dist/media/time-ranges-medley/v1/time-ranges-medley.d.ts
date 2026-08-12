/**
 * `@m0saic-starter/media/time-ranges-medley/v1` — MANY windows, ONE prop.
 *
 * ONE CONCEPT: the `picker: "time-ranges"` control — the MULTI-range
 * sibling of time-range-clip's pair. Where the single window is two flat
 * number props matched by name, multiple windows are ONE `type: "json"`
 * prop whose value is `Array<{ startMs, endMs, label? }>`: the editor's
 * multi-range studio reads and writes the whole array through that one
 * prop, in one write. The shape is enforced twice — `constraints.jsonSchema`
 * documents it for the editor, render() gates it for real (collect-ALL,
 * with remedies).
 *
 * The medley renders every range side by side: one column per window,
 * each an ordinary media source with its own `clipStartMs` +
 * `clipDurationMs` — the same start+LENGTH conversion as the single-range
 * unit, mapped over an array.
 */
export type MedleyRange = {
    startMs: number;
    endMs: number;
    label?: string;
};
export type TimeRangesMedleyProps = {
    /** The video to pull windows from. */
    video?: string;
    /** The windows, ms, source-relative — one column each (1-6). */
    ranges?: MedleyRange[];
};
export declare const TimeRangesMedleyV1: import("@m0saic/types").MosaicTemplate<TimeRangesMedleyProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default TimeRangesMedleyV1;
