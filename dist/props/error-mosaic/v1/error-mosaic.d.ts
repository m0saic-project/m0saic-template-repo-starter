/**
 * `@m0saic-starter/props/error-mosaic/v1` — failing on-canvas, usefully.
 *
 * ONE CONCEPT: `makeErrorMosaic`. A thrown error is right for headless
 * callers, but inside an editor a throw is a dead preview. The friendlier
 * pattern for user-facing validation:
 *
 *   1. Collect EVERY problem (structures are wrong in several places at
 *      once), each with a REMEDY — what to change, not just what's wrong.
 *   2. Return `makeErrorMosaic(problems, {...})` — a complete, renderable
 *      document that shows the report card on canvas. The preview stays
 *      alive; the user reads the remedies and fixes the props.
 *
 * This template's three knobs are deliberately breakable so you can watch
 * the report card appear and stack multiple remedies.
 */
export type ErrorMosaicProps = {
    /** Split ratio for the happy-path card (0.1-0.9). */
    ratio?: number;
    /** Accent color (#rrggbb). */
    accent?: string;
    /** Comma-separated tags (1-4 items, ASCII, 1-8 chars each). */
    tags?: string;
};
export declare const ErrorMosaicV1: import("@m0saic/types").MosaicTemplate<ErrorMosaicProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ErrorMosaicV1;
