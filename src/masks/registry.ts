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
  },
  {
    slug: "path-mask",
    templateId: "@m0saic-starter/masks/path-mask/v1",
    exportName: "PathMaskV1",
  },
];
