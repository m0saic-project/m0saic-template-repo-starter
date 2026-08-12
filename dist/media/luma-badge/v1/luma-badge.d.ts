/**
 * `@m0saic-starter/media/luma-badge/v1` — content-aware, with a fallback.
 *
 * ONE CONCEPT: `ctx.analysis` + GRACEFUL DEGRADATION. The analysis
 * surface lets a template ASK about the pixels ("how bright is the
 * bottom-right corner of this image?") without doing any I/O itself —
 * `regionLuminance` runs host-side (ffmpeg crop + signalstats) and
 * returns an average luma 0-255. The badge picks dark-on-light or
 * light-on-dark from the answer.
 *
 * THE LAW: `ctx.analysis` is OPTIONAL. Design mode (and lite hosts)
 * hand render() no analysis at all — a template that requires it is
 * broken in the editor. Degrade to a stated default and SAY SO on the
 * caption, so the fallback is visible, not silent.
 */
export type LumaBadgeProps = {
    /** The image the badge sits on. */
    image?: string;
    /** Badge text (ASCII, 1-16 chars). */
    badge?: string;
};
export declare const LumaBadgeV1: import("@m0saic/types").MosaicTemplate<LumaBadgeProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default LumaBadgeV1;
