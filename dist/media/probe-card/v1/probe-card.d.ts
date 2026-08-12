/**
 * `@m0saic-starter/media/probe-card/v1` — read the probe, don't probe.
 *
 * ONE CONCEPT: `ctx.media` is the HOST's ffprobe registry. Templates do
 * no I/O and spawn no ffprobe — before render() runs, the host probes
 * every media path the props mention and keys the results by the RAW
 * prop string. This card just prints that entry for whatever file you
 * pick (image or video): kind, dimensions, duration for time-based
 * media — the facts every layout decision downstream is built on.
 */
export type ProbeCardProps = {
    /** Any image or video — the card prints its probe. */
    media?: string;
};
export declare const ProbeCardV1: import("@m0saic/types").MosaicTemplate<ProbeCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ProbeCardV1;
