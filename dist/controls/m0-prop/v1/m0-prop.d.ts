/**
 * `@m0saic-starter/controls/m0-prop/v1` — the layout itself as a prop.
 *
 * ONE CONCEPT: `type: "m0"`. In m0saic the product IS the m0 string — so of
 * course a string of layout can be a VALUE. Declaring the type (instead of
 * `type: "string"`) tells the editor the value is grammar, not prose: Make
 * renders an m0-aware editor for it, and everyone downstream knows to
 * validate rather than trust.
 *
 * That validation is the lesson's second half. A prop that is grammar gets
 * the same discipline as any other untrusted input, with the DSL's own
 * tools: `isValidM0String` at the boundary (never regex, never trust), and
 * a report card — not a dead render — when the string doesn't parse.
 *
 * The render frames the user's layout: the m0 becomes a nested cell inside
 * a padded stage, drawn as a wireframe (one alternating tile per claim,
 * counted with `evaluateM0().frameCount` — the same binding rule the
 * quality chapter's real-capture lessons use). Bring your own geometry;
 * this template supplies the pixels.
 *
 * DEGRADE, DON'T REFUSE. Dictionary layouts run to many thousands of chars
 * and hundreds of claims, and every rung of the ladder still answers:
 *   - invalid grammar            → report card naming the validator;
 *   - beyond MAX_CHARS           → honest "beyond this lesson", never
 *                                  "does not parse" (the cap is the
 *                                  lesson's, not the grammar's);
 *   - over the claim budget      → the STATS CARD: the layout measured
 *                                  (chars, claims, floors, safe minimum)
 *                                  instead of drawn — a working render;
 *   - valid but infeasible here  → the floors card naming the safe
 *                                  minimum the framed layout needs.
 */
export type M0PropProps = {
    /** The layout to frame — a raw m0 string. */
    layout?: string;
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Grammar has no cap; this LESSON stops wireframing somewhere sane. */
export declare const MAX_CHARS = 32000;
export declare const WIREFRAME_CLAIM_BUDGET = 120;
/** A friendly default: a little dashboard-ish arrangement. */
export declare const DEFAULT_LAYOUT = "3(2[1,1],1,2[1,2(1,1)])";
export declare const M0PropV1: import("@m0saic/types").MosaicTemplate<M0PropProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default M0PropV1;
