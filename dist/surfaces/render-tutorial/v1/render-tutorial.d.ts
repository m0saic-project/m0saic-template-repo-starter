/**
 * `@m0saic-starter/surfaces/render-tutorial/v1` — the lesson that IS its
 * tutorial.
 *
 * ONE CONCEPT: `renderTutorial` returns a renderable the user WATCHES in
 * place — and a real walkthrough is a PIPELINE of pages, each declaring its
 * own `durationMs`. The tutorial owns its timing:
 *
 *   NEVER read `ctx.target.durationMs` in a tutorial.
 *
 * The host passes no form duration, because a tutorial is not rendered into
 * a window — it is scrubbed. Its natural page durations are the whole
 * timeline. Geometry from `ctx.target` is right and expected; DURATION from
 * `ctx.target` is the bug.
 *
 * Every other template in this repo hands `lessonTutorial()` some copy and
 * gets the curriculum's standard ONE-page card. This is the only lesson that
 * builds its own, because building one is the thing being taught — and the
 * shape difference is the point: the standard page is a single
 * `mosaic_document`; a walkthrough is a `mosaic_pipeline` whose steps are
 * pages.
 *
 * The rest of the contract, briefly:
 *   - Invoked with the template's OWN `defaultProps`, never the user's
 *     working props, so the walkthrough reads the same regardless of editor
 *     state. (A cover gets the working props — which at the only moment it
 *     shows ARE the defaults.)
 *   - OPT-IN: no tutorial declared means the "?" pill does not appear.
 *   - An erroring tutorial renders an error mosaic rather than failing
 *     silently — the user clicked, so silence would read as a dead button.
 *     This is the opposite of `renderCover`, on purpose.
 *   - Deterministic, browser-safe, no `ctx.media`.
 *   - The tutorial substitutes only the STAGE. The real document keeps
 *     feeding save, geometry edits and the Make button, so "view-only" holds
 *     by construction instead of by discipline.
 */
export type RenderTutorialProps = {
    /** Headline on the rendered card (the tutorial ignores this). */
    title?: string;
    /** Page background (#rrggbb). */
    pageColor?: string;
};
export declare const RenderTutorialV1: import("@m0saic/types").MosaicTemplate<RenderTutorialProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RenderTutorialV1;
