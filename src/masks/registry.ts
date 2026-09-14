import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `masks` — array order is the teaching order.
 * Opens with the everyday shapes (one path each), then the hand-authored
 * path where the fill rule and the matte start to matter.
 */
export const masksRegistry: StarterRegistryEntry[] = [
  {
    slug: "shape-masks",
    templateId: "@m0saic-starter/masks/shape-masks/v1",
    exportName: "ShapeMasksV1",
    title: "45 · Shape Masks",
    description:
      "There are no shape primitives — every shape is a color tile wearing an SVG path. Circle, ellipse, rounded rect and pill, each authored against the cell's own box, with the caption printing the path math.",
    tags: ["masks", "shapes", "lesson"],
  },
  {
    slug: "path-mask",
    templateId: "@m0saic-starter/masks/path-mask/v1",
    exportName: "PathMaskV1",
    title: "46 · Path Mask",
    description:
      "A donut, and the two rules behind it: a shape inside another cuts a hole only when it is DRAWN the other way round (the two directions cancel; draw them the same way and the middle fills in silently), and `matte` renders the area outside the path at a chosen alpha instead of clipping it away.",
    tags: ["masks", "paths", "lesson"],
  },
];
