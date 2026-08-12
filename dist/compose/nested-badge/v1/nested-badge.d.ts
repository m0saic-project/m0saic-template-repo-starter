/**
 * `@m0saic-starter/compose/nested-badge/v1` — the CHILD half of
 * compose/nested-template. A badge that lays itself out for whatever box it
 * is handed.
 *
 * ONE CONCEPT (from the child's side): a nested template is an ordinary
 * template. It reads `ctx.target` and knows nothing about who called it —
 * which is exactly why the parent must hand it a `slot`, and why this file
 * has no idea it is usually 30% of someone else's canvas.
 *
 * `internal: true` says it is not meant as a top-level pick: hosts keep it
 * out of the main picker while leaving it available for nested rendering.
 * It still renders perfectly well on its own — internal is about INTENT, not
 * capability, and being able to open a child directly is how you debug one.
 *
 * Everything here is sized off `ctx.target`, never a constant: the accent
 * rail is a share of the width, the label is fitted to its own band. Hand it
 * a 384×720 slot and it fills that; hand it 1280×720 and it fills that too.
 */
export type NestedBadgeProps = {
    /** The badge's line of text. */
    text?: string;
    /** Accent rail color (#rrggbb). */
    accent?: string;
};
export declare const NestedBadgeV1: import("@m0saic/types").MosaicTemplate<NestedBadgeProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NestedBadgeV1;
