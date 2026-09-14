import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `surfaces` — array order is the teaching order.
 *
 * `render` is required and is the only entry point the CLI ever calls. This
 * chapter is about the other three: real `MosaicTemplate` members that hosts
 * dispatch, all editor-only and all opt-in. Order runs from the surface with
 * a fallback (lite) to the two without (cover, tutorial).
 *
 * Deliberately NOT here: the `renderMode: "premium" | "light"` prop spelling.
 * It is a house naming convention rather than an API — nothing in
 * `@m0saic/types` knows it — so it teaches an author what to CALL a knob,
 * not what the engine does. The cost mechanism underneath it (a per-pixel
 * alpha expression versus a per-operation enable gate) is real, and belongs
 * with the perf lessons rather than beside the dispatch surfaces.
 */
export const surfacesRegistry: StarterRegistryEntry[] = [
  {
    slug: "render-lite",
    templateId: "@m0saic-starter/surfaces/render-lite/v1",
    exportName: "RenderLiteV1",
    title: "68 · Render Lite",
    description:
      "The preview stand-in. Declares renderLite so the editor draws a cheap card while you poke props, and the real N-by-N grid renders only on Make — the one optional surface that falls back to render when absent instead of simply not happening.",
    tags: ["surfaces", "preview", "lesson"],
  },
  {
    slug: "render-cover",
    templateId: "@m0saic-starter/surfaces/render-cover/v1",
    exportName: "RenderCoverV1",
    title: "69 · Render Cover",
    description:
      "A friendly first frame for a template that fails fast. render() still reports exactly what is missing when it has no clip; renderCover puts a welcome page there on a pure-default open — opt-in, dismissed by the first prop edit, and silently skipped (never synthesized) when absent or broken.",
    tags: ["surfaces", "onboarding", "lesson"],
  },
  {
    slug: "render-tutorial",
    templateId: "@m0saic-starter/surfaces/render-tutorial/v1",
    exportName: "RenderTutorialV1",
    title: "70 · Render Tutorial",
    description:
      "The only lesson here that builds its own tutorial instead of using the curriculum's standard page — because building one is what it teaches. Three pages as a pipeline, each declaring its own durationMs, proving that a tutorial owns its timing and never reads ctx.target.durationMs.",
    tags: ["surfaces", "tutorial", "lesson"],
  },
];
