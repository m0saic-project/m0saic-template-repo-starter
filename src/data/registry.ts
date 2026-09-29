import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `data` — array order is the teaching order.
 * The chain in dependency order (fetch → reshape → draw), then the two
 * shapes of a file written beside the render.
 */
export const dataRegistry: StarterRegistryEntry[] = [
  {
    slug: "fixture-fetcher",
    templateId: "@m0saic-starter/data/fixture-fetcher/v1",
    exportName: "FixtureFetcherV1",
  },
  {
    slug: "pure-adapter",
    templateId: "@m0saic-starter/data/pure-adapter/v1",
    exportName: "PureAdapterV1",
  },
  {
    slug: "data-card",
    templateId: "@m0saic-starter/data/data-card/v1",
    exportName: "DataCardV1",
  },
  {
    slug: "sidecar-json",
    templateId: "@m0saic-starter/data/sidecar-json/v1",
    exportName: "SidecarJsonV1",
  },
  {
    slug: "sidecar-text",
    templateId: "@m0saic-starter/data/sidecar-text/v1",
    exportName: "SidecarTextV1",
  },
];
