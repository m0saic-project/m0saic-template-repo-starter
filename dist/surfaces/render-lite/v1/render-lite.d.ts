/**
 * `@m0saic-starter/surfaces/render-lite/v1` — the preview stand-in.
 *
 * ONE CONCEPT: `renderLite` is a SECOND entry point. Hosts that draw a
 * preview — the editor's live canvas, template selection — call it INSTEAD
 * of `render`. `render` runs only when a human commits to a Make.
 *
 * The dispatch rule, which is the whole surface:
 *
 *   renderLite ABSENT  -> hosts fall back to `render` (historical behavior;
 *                         a preview must always show SOMETHING).
 *   renderLite PRESENT -> the preview shows this, and only this.
 *
 * Note the asymmetry with the other two optional surfaces: `renderCover` and
 * `renderTutorial` return null when absent and are NEVER synthesized, but
 * `renderLite` falls back. Absent cover means "no cover"; absent lite means
 * "use render".
 *
 * WHY IT EXISTS: a `tier: "capability"` template whose `render` does real
 * work — spawns a process, writes files, fetches the network — would run all
 * of that just from being SELECTED in a picker. `renderLite` returns a cheap
 * card instead, so the editor shows feedback rather than starting a
 * thirty-minute job. It MUST NOT perform `render`'s side effects.
 *
 * Being honest about this lesson: this template is `tier: "core"` and its
 * `render` is cheap, so it does not NEED a lite path — core-tier templates
 * rarely do. It declares one anyway because the seam is otherwise invisible,
 * and a seam you cannot see is a seam you will get wrong. Watch it directly:
 * poke the Tiles knob and the preview stays a single card; press Make and
 * the real grid renders. That gap IS the surface.
 *
 * Constraints shared by all three optional surfaces: deterministic,
 * side-effect-free, browser-safe, sized off `ctx.target`, and NEVER reading
 * `ctx.media` (hosts pass an empty registry — no probe pass runs).
 */
export type RenderLiteProps = {
    /** Grid density for the real render — N by N tiles. */
    tiles?: number;
    /** Grid fill (#rrggbb). */
    accentColor?: string;
    /** Alternating fill, and the lite card's background (#rrggbb). */
    panelColor?: string;
};
export declare const RenderLiteV1: import("@m0saic/types").MosaicTemplate<RenderLiteProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RenderLiteV1;
