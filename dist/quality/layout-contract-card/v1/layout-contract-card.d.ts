import type { LayoutConstraint, RelationalConstraint } from "@m0saic/template-utils";
/**
 * `@m0saic-starter/quality/layout-contract-card/v1` — invariants that
 * outlive the string, DRAWN.
 *
 * ONE CONCEPT: the m0 a template returns is exact but DISPOSABLE. Change the
 * canvas or a prop and the whole geometry tree is re-addressed — tile order
 * and stableKeys are per-string, so they cannot carry authored intent. The
 * one thing that survives every regeneration is the LABEL you stamp on a
 * source (`editor: { label }`).
 *
 * A constraint targets a KIND, not a node. This card tags four rail tiles
 * `"card"` and ONE relation line constrains all four:
 *
 *   { label: "card", equal: "size" }
 *
 * "wherever the cards land, they are all the same size." Canvas-INDEPENDENT
 * by construction — one declaration holds at every size, which is the whole
 * point, because the bug you are hunting only appears at some sizes.
 *
 * THE GATE, now visual: `withLayoutContract(doc, ctx, { debug })` with
 * `debug` falsy returns your document UNTOUCHED — same reference, no parse,
 * no allocation. That is why a shipped template can leave the call in
 * permanently. Turn it on and the render becomes the CONTRACT VIEW:
 *
 *   - rules hold  -> every rule member drawn GREEN, the banner naming each
 *     rule with its measured result ("card equal size OK - spread 0.4%").
 *   - rule broken -> the offender drawn RED among the green survivors, the
 *     banner naming the label and the number that broke.
 *
 * A contract that silently no-ops on success is indistinguishable from a
 * contract that never ran; the green view is the proof it ran.
 *
 * Three ways to run the same check, by audience:
 *   checkLayout()        - the pure evaluator; loop on it in a layout search.
 *   withLayoutContract() - the dev tripwire; draws the contract view.
 *   assertLayout()       - the throwing sibling, for tests and CI. This
 *                          template's test uses it (see the .test.ts).
 *
 * Watch it work: turn Debug layout on (four green cards). Then set Stretch
 * card to 1.5 — one red card among the green.
 */
export type LayoutContractCardProps = {
    /** Width multiplier on the THIRD card. 1 = uniform; past ~1.02 the equal-size rule fires. */
    stretchCard?: number;
    /** Run the layout contract and render the contract view. */
    debugLayout?: boolean;
    /** Card fill (#rrggbb). */
    cardColor?: string;
    /** Header fill (#rrggbb). */
    headerColor?: string;
};
/** Exported so the test can assert the same contract the template ships. */
export declare const LAYOUT_RELATIONS: RelationalConstraint[];
export declare const LAYOUT_CONSTRAINTS: LayoutConstraint[];
export declare const LayoutContractCardV1: import("@m0saic/types").MosaicTemplate<LayoutContractCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default LayoutContractCardV1;
