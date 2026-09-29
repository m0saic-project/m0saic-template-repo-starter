import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `text` — array order is the teaching order.
 * Opens with the map (the three pipelines side by side); the per-technique
 * deep dives follow.
 */
export const textRegistry: StarterRegistryEntry[] = [
  {
    slug: "text-three-ways",
    templateId: "@m0saic-starter/text/text-three-ways/v1",
    exportName: "TextThreeWaysV1",
  },
  {
    slug: "fit-text",
    templateId: "@m0saic-starter/text/fit-text/v1",
    exportName: "FitTextV1",
  },
  {
    slug: "count-up",
    templateId: "@m0saic-starter/text/count-up/v1",
    exportName: "CountUpV1",
  },
  {
    slug: "carved-type",
    templateId: "@m0saic-starter/text/carved-type/v1",
    exportName: "CarvedTypeV1",
  },
];
