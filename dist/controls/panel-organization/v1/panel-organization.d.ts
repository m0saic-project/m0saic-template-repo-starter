/**
 * `@m0saic-starter/controls/panel-organization/v1` — the props panel is
 * AUTHORED, not emitted.
 *
 * ONE CONCEPT: `meta.ui` placement. A template with a dozen props dumps a
 * wall of controls unless the author says where each belongs. Four knobs
 * shape the panel, and this template uses all of them:
 *
 *  - the TOP GROUP is `required` props PLUS optional ones pinned with
 *    `ui.primary: true` — `accent` here is optional (it has a default) but
 *    important enough not to bury under the Optional fold;
 *  - everything else lands in the OPTIONAL fold (`frame` here);
 *  - `ui.visibleWhen: { prop, equals }` SKIPS a control until its sibling
 *    gate matches — `badgeText` only exists in the panel while `showBadge`
 *    is on (the comparison is string-coerced: a boolean gate matches
 *    `equals: "true"`);
 *  - `ui.hidden: true` removes a prop from the panel entirely while it
 *    stays fully render-effective — `watermarkTag` below never shows a
 *    control, yet its value is on the canvas. Hidden ≠ dead: agents and
 *    saved files still set it.
 *
 * Render is the proof: every one of these props paints, whatever the panel
 * did with them. Panel placement is an EDITOR conversation; render sees
 * plain values, always.
 */
export type PanelOrganizationProps = {
    /** Required — always in the top group. */
    title?: string;
    /** Optional but pinned to the top group via ui.primary. */
    accent?: string;
    /** Plain optional — lives under the Optional fold. */
    frame?: boolean;
    /** The gate for badgeText's visibility. */
    showBadge?: boolean;
    /** Only visible in the panel while showBadge is on. */
    badgeText?: string;
    /** ui.hidden — no control at all, still render-effective. */
    watermarkTag?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const PanelOrganizationV1: import("@m0saic/types").MosaicTemplate<PanelOrganizationProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PanelOrganizationV1;
