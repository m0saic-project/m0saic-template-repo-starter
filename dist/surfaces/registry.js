"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surfacesRegistry = void 0;
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
exports.surfacesRegistry = [
    {
        slug: "render-lite",
        templateId: "@m0saic-starter/surfaces/render-lite/v1",
        exportName: "RenderLiteV1",
    },
    {
        slug: "render-cover",
        templateId: "@m0saic-starter/surfaces/render-cover/v1",
        exportName: "RenderCoverV1",
    },
    {
        slug: "render-tutorial",
        templateId: "@m0saic-starter/surfaces/render-tutorial/v1",
        exportName: "RenderTutorialV1",
    },
];
