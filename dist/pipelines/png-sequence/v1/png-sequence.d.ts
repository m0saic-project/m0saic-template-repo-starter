/**
 * `@m0saic-starter/pipelines/png-sequence/v1` — N numbered stills out of one
 * template.
 *
 * ONE CONCEPT: a frame sequence is just `emit: "multi"` where every step is
 * an IMAGE. Each step is a document with `format: { kind: "image", container:
 * "png" }`, so the engine writes one PNG per step instead of concatenating
 * anything.
 *
 * NAMING IS THE DELIVERABLE HERE. Files come out as `{base}-{step.name}.png`,
 * so a sequence wants zero-padded names — `frame-001`, `frame-002` — or
 * anything reading the folder sorts 10 before 2. The padding is the
 * template's job; the engine only guarantees the name it was given.
 *
 * `step.label` rides along for the CLI's `--output-pattern` `{{label}}`
 * token, which is how a batch render puts the source's own filename into
 * each output name.
 *
 * Sequences are the one case where step count is a REAL cost: N steps means N
 * renders and N files. Keep the count a prop, keep it small by default, and
 * let the caller opt into more.
 */
export type PngSequenceProps = {
    /** How many frames to emit. */
    frames?: number;
    /** Prefix for each step name — the filename basis. */
    prefix?: string;
};
export declare const PngSequenceV1: import("@m0saic/types").MosaicTemplate<PngSequenceProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PngSequenceV1;
