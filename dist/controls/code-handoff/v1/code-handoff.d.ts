import type { MosaicCodeValue } from "@m0saic/types";
/**
 * `@m0saic-starter/controls/code-handoff/v1` — a prop that flows the OTHER
 * way: code passed FROM the template TO the user.
 *
 * ONE CONCEPT: `type: "code"` is a HANDOFF type. Most props are the user
 * talking to the template; this one is the template talking back. The
 * value is a `MosaicCodeValue` — `{ language, code }` — shipped by the
 * AUTHOR in `defaultProps`, and the editor renders it as a read-only,
 * selectable, copyable code window (no onChange — it is not an input).
 * `render()` may ignore the prop entirely; it is informational.
 *
 * Why a template would talk back: some workflows need the user to run
 * something OUTSIDE the app — the production first-adopter is the
 * page-capture template, which hands the user a browser snippet to run on
 * the page they want captured, whose output comes back through the
 * template's other props. The handoff prop closes that loop inside the
 * editor: instructions live next to the props they feed, in a window made
 * for copying, with the language attached.
 *
 * This lesson's handoff is honest to the pattern: the exact CLI command
 * that renders THIS template headless. Copy it out of the editor, run it
 * in a terminal, and compare — the same document either way. The render
 * USES the prop only to draw the card about it; ignoring it entirely
 * (as the page-capture template does) is equally correct.
 */
export type CodeHandoffProps = {
    /** The handoff: read-only in the editor, shipped by the author. */
    runCommand?: MosaicCodeValue;
    /** A normal input prop, to make the direction contrast visible. */
    label?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** The handoff payload — authored HERE, shipped via defaultProps. */
export declare const RUN_COMMAND: MosaicCodeValue;
/** Validate the handoff shape (defaults are still validated — house law). */
export declare function parseHandoff(raw: CodeHandoffProps["runCommand"]): MosaicCodeValue;
export declare const CodeHandoffV1: import("@m0saic/types").MosaicTemplate<CodeHandoffProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CodeHandoffV1;
