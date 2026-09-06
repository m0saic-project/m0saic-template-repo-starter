import { templates } from "./index";

/**
 * Repo-wide props-surface conventions — enforced over EVERY exported
 * template, so a new chapter can't quietly drift from the law.
 *
 * The colour-prop rule that used to live here (isColor + colorPicker) is now
 * a platform template convention: `defineMosaicTemplate` throws on it at
 * definition time and `tools/check-registry.mjs` runs it on every build, so
 * the build IS the test. What stays here is the repo's OWN law: every lesson
 * ships a tutorial page.
 */

describe("props-surface conventions (whole repo)", () => {
  it("every template ships a renderTutorial — the lesson's voice in Make", () => {
    // Make has no prose surface; the tutorial page is how a lesson tells the
    // user what it teaches and which knobs to poke. Standard page via
    // _shared/tutorial's lessonTutorial() — except the
    // surfaces/render-tutorial unit, whose bespoke tutorial IS its lesson.
    const missing = templates
      .filter(
        (t) =>
          typeof (t as { renderTutorial?: unknown }).renderTutorial !== "function",
      )
      .map((t) => String(t.id));
    expect(missing).toEqual([]);
  });
});
