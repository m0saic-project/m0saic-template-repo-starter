/**
 * `@m0saic-starter/compose/nested-template/v1` — call another TEMPLATE, not
 * another document.
 *
 * ONE CONCEPT: `renderNestedTemplate(id, props, ctx, { slot })` looks the
 * template up in the host's registry, renders it, and hands back a document
 * you drop straight into `children`. Where compose/child-mosaic BUILDS its
 * child inline, this one CALLS one — the difference between a subroutine and
 * a copy-paste.
 *
 * `slot` is the part everyone forgets. Without it the child renders against
 * the PARENT's `ctx.target`: text fitted for a 1280px canvas, then squeezed
 * into a 384px cell. Pass the slot's real pixel box and the child's own
 * `ctx.target` becomes that box, so it lays itself out for the space it will
 * actually occupy. (`fps` and `durationMs` default to the parent's — pass
 * them only when the slot's timing differs.)
 *
 * Two contracts come with the call:
 *
 *   - THE CHILD MUST BE REGISTERED. The lookup is by id against the host's
 *     registry, which is what makes this composition late-bound. In this
 *     repo the host registers everything the entry module exports, so the
 *     badge is available exactly because it ships in `templates[]` — not
 *     because this file imports it. (It doesn't.)
 *   - The child may legally return a PIPELINE, and `children` accepts one —
 *     it renders first and the parent consumes its stitched output.
 */
export type NestedTemplateProps = {
    /** Text handed down to the badge child. */
    badgeText?: string;
    /** Badge slot width, as a percent of the canvas (20-50). */
    slotPct?: number;
};
export declare const NestedTemplateV1: import("@m0saic/types").MosaicTemplate<NestedTemplateProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NestedTemplateV1;
