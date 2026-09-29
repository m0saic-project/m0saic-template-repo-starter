import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `basics` — array order is the teaching order.
 */
export const basicsRegistry: StarterRegistryEntry[] = [
  {
    slug: "hello-world",
    templateId: "@m0saic-starter/basics/hello-world/v1",
    exportName: "HelloWorldV1",
  },
  {
    slug: "anatomy",
    templateId: "@m0saic-starter/basics/anatomy/v1",
    exportName: "AnatomyV1",
  },
  {
    slug: "hot-reload-canary",
    templateId: "@m0saic-starter/basics/hot-reload-canary/v1",
    exportName: "HotReloadCanaryV1",
  },
  {
    slug: "color-tiles",
    templateId: "@m0saic-starter/basics/color-tiles/v1",
    exportName: "ColorTilesV1",
  },
  {
    slug: "aspect-adaptive-card",
    templateId: "@m0saic-starter/basics/aspect-adaptive-card/v1",
    exportName: "AspectAdaptiveCardV1",
  },
];
