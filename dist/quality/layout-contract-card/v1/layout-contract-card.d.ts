import type { LayoutConstraint } from "@m0saic/template-utils";
/**
 * `@m0saic-starter/quality/layout-contract-card/v1` — invariants that
 * outlive the string.
 *
 * ONE CONCEPT: the m0 a template returns is exact but DISPOSABLE. Change the
 * canvas or a prop and the whole geometry tree is re-addressed — tile order
 * and stableKeys are per-string, so they cannot carry authored intent. The
 * one thing that survives every regeneration is the LABEL you stamp on a
 * source (`editor: { label }`).
 *
 * So you assert against the label:
 *
 *   { label: "sidebar", maxWidthFrac: 0.4 }
 *
 * "wherever the sidebar lands, it never takes more than 40% of the width."
 * Canvas-INDEPENDENT by construction — one declaration holds at every size,
 * which is the whole point, because the bug you are hunting only appears at
 * some sizes.
 *
 * A constraint targets a KIND, not a node. Tag twelve grid cells `"cell"` and
 * one line constrains all twelve.
 *
 * THE GATE: `withLayoutContract(doc, ctx, { debug })` with `debug` falsy
 * returns your document UNTOUCHED — same reference, no parse, no allocation.
 * That is why a shipped template can leave the call in permanently: it costs
 * nothing until someone flips the knob. Turn it on and a violation renders a
 * LAYOUT_CONTRACT error card at exactly the canvas that broke, instead of a
 * plausible-looking wrong picture.
 *
 * Three ways to run the same check, by audience:
 *   checkLayout()        - the pure evaluator; loop on it in a layout search.
 *   withLayoutContract() - the dev tripwire; renders the violation.
 *   assertLayout()       - the throwing sibling, for tests and CI. This
 *                          template's test uses it (see the .test.ts).
 *
 * Watch it fire: set Sidebar weight to 5 (half the width) and turn Debug
 * layout on.
 */
export type LayoutContractCardProps = {
    /** Sidebar share, in tenths of the canvas width. */
    sidebarWeight?: number;
    /** Run the layout contract and render violations. */
    debugLayout?: boolean;
    /** Sidebar fill (#rrggbb). */
    sidebarColor?: string;
    /** Body fill (#rrggbb). */
    bodyColor?: string;
};
/** Exported so the test can assert the same contract the template ships. */
export declare const LAYOUT_CONSTRAINTS: LayoutConstraint[];
export declare const LayoutContractCardV1: import("@m0saic/types").MosaicTemplate<LayoutContractCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default LayoutContractCardV1;
