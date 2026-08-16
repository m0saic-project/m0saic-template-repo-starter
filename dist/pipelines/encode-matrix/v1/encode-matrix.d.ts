/**
 * `@m0saic-starter/pipelines/encode-matrix/v1` — one render, many
 * deliverables, WITHOUT a pipeline.
 *
 * ONE CONCEPT: `encodes` is a separate axis from geometry. The document
 * renders ONCE into a workspace master, and each `encodes` entry is a
 * post-render transcode pass off that master:
 *
 *   1 render → 1 master + N encodes
 *
 * That is the cheap way to ship the same picture as h264/mp4, VP9/webm and a
 * small mobile variant. Compare pipelines/fan-out, which re-renders each
 * variant because its LAYOUT changes.
 *
 * What an encode CAN change: codec, container, pixel format, encoder tuning,
 * audio, colour tagging, container metadata — and `size`, but only as an
 * ffmpeg `scale` pass, which STRETCHES. There is no re-layout and no
 * aspect-aware padding, so a 16:9 master scaled into a 1:1 encode is squashed,
 * not recomposed. When the shape changes, you want fan-out.
 *
 * What an encode CANNOT change: `fps`, `durationMs`, the `target` preset, or
 * the `emit` mode. Those belong to the master render.
 *
 * On a pipeline the same field applies per emitted file, so `emit:"multi"`
 * with 3 steps and 2 encodes writes 3 × 2 files.
 */
export type EncodeMatrixProps = {
    /** Add a VP9/WebM variant. */
    web?: boolean;
    /** Add a half-size h264 variant (a scale pass — it stretches). */
    mobile?: boolean;
    /** Title on the card. */
    title?: string;
};
export declare const EncodeMatrixV1: import("@m0saic/types").MosaicTemplate<EncodeMatrixProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default EncodeMatrixV1;
