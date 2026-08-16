"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_PACKS = exports.TEMPLATE_REPO = void 0;
const types_1 = require("@m0saic/types");
/**
 * Who this repo is. The entry module (src/index.ts) re-exports this as
 * `repo` — one of the two exports every Mosaic host requires from an
 * external template repo (the other is `templates`).
 *
 * Forks: change `repoId` to your own handle before publishing — template ids
 * start with it, and id ownership in a running host is first-registrant-wins
 * per id. `@m0saic-starter` is the id namespace of THIS curated repo.
 */
exports.TEMPLATE_REPO = {
    repoId: (0, types_1.asRepoId)("@m0saic-starter"),
    displayName: "m0saic Template Starter",
    schemaVersion: 1,
    description: "The m0saic developer curriculum: minimal example templates, each exercising exactly one knob of the template-authoring surface. Clone it, load it, read it, fork it.",
    curator: "m0saic",
    homepage: "https://github.com/m0saic-project/m0saic-template-repo-starter",
    assets: { templatesDir: "assets/templates" },
};
/**
 * The curriculum chapters, in TEACHING ORDER — this array's order flows
 * verbatim into template-manifest.json `packs[]`, which is what browse UIs
 * and CURRICULUM.md follow. Each pack id doubles as the src/<pack>/ folder
 * name and the `<pack>` segment of member template ids.
 */
exports.TEMPLATE_PACKS = [
    {
        id: "basics",
        title: "Basics",
        description: "Hello world, the hot-reload loop, color tiles, and sizing off ctx.target — the smallest possible templates that still do everything right.",
    },
    {
        id: "geometry",
        title: "Geometry",
        description: "The m0 geometry contract as runnable lessons: quantization you can predict, GCD collapse, ratio vs absolute, passthrough donation, overlays, lattice gutters (both spellings), inset recovery, placeRect, and masks as fiber.",
    },
    {
        id: "props",
        title: "Props",
        description: "The typed props surface as runnable lessons: one knob of every scalar type, seeded determinism, self-declaring color controls, structured json data, the meta/control affordances, and failing usefully with makeErrorMosaic.",
    },
    {
        id: "media",
        title: "Media",
        description: "Files, folders, probes, and time: the media prop pipeline, ctx.media as the host's ffprobe registry, the time-range scrubber pair, content-aware analysis with stated fallbacks, playSpeed, the audio mix + mute idiom, and the url-asset trade-off.",
    },
    {
        id: "text",
        title: "Text",
        description: "Text that renders right: the three glyph pipelines side by side (drawtext, svg rasterizer, mask-carved), then the per-technique deep dives — fitting, expressions, and carved type.",
    },
    {
        id: "masks",
        title: "Masks",
        description: "Shapes without shape primitives: the everyday paths (circle, ellipse, rounded rect, pill) authored against their cell, then the hand-written path where winding cuts holes and `matte` turns the leftover box into a translucent wash.",
    },
    {
        id: "compose",
        title: "Compose",
        description: "Documents inside documents: children and bottom-up evaluation, real geometry as headroom for rotation, calling another template with a slot, a keyframed camera over a space you own, a theme taken from upstream, and the reduce-to-one refactor all of it enables.",
    },
    {
        id: "pipelines",
        title: "Pipelines",
        description: "More than one document, and more than one file: steps and transitions, emit single vs multi, encodes as a separate axis, ref sources mirroring rendered pixels within a doc and back across steps, and a pipeline living inside a tile.",
    },
    {
        id: "data",
        title: "Data",
        description: "Facts flowing through a render: publishing a payload on the upstream channel (and what the capability tier buys you), reshaping it with a pure adapter, drawing it, and writing files beside the deliverable — JSON for machines, verbatim text for real formats like captions.",
    },
];
