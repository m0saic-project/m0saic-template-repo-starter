import type { MosaicDocument, MosaicEngineContext } from "@m0saic/types";
/**
 * The curriculum's standard `renderTutorial` page.
 *
 * Make has no prose surface, so the tutorial IS how a lesson talks to its
 * user: press the "?" pill, read what this template teaches and which knobs
 * to go poke, close it, mutate props. One consistent page for every lesson —
 * m0saic M top-left (dsl-tutorial chrome style), the lesson title, the
 * teaching, a "try" list, and the hand-off line.
 *
 * renderTutorial contract notes (the parts that bite):
 *   - EDITOR-ONLY: hosts call it behind an explicit affordance; it never
 *     runs on the CLI render path.
 *   - It receives the template's own defaultProps and owns its OWN duration
 *     (never derive length from ctx.target.durationMs — geometry from
 *     ctx.target is fine, and is exactly what we do).
 *   - ctx.media is empty — a tutorial may not depend on media.
 *
 * (Every template in this repo uses this standard page, except the
 * `surfaces/render-tutorial` lesson itself — building a bespoke tutorial is
 * that template's whole point.)
 */
export type LessonTutorialSpec = {
    /** The lesson title (usually the template's label). */
    title: string;
    /** Teaching paragraphs — each entry is one line/paragraph, ASCII only. */
    lines: string[];
    /** "Try:" hints — the UI the user should go poke after closing this. */
    explore: string[];
};
/**
 * Build a standard tutorial page renderer. Assign the result directly:
 * `renderTutorial: lessonTutorial({ title, lines, explore })`.
 */
export declare function lessonTutorial(spec: LessonTutorialSpec): (_props: unknown, ctx: MosaicEngineContext) => Promise<MosaicDocument>;
