import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `props` — array order is the teaching order.
 * The arc: the typed surface → determinism under randomness → color
 * declarations → structured data → the meta/control surface → failing
 * usefully on-canvas.
 */
export const propsRegistry: StarterRegistryEntry[] = [
  {
    slug: "typed-props-tour",
    templateId: "@m0saic-starter/props/typed-props-tour/v1",
    exportName: "TypedPropsTourV1",
  },
  {
    slug: "seeded-shuffle",
    templateId: "@m0saic-starter/props/seeded-shuffle/v1",
    exportName: "SeededShuffleV1",
  },
  {
    slug: "color-props",
    templateId: "@m0saic-starter/props/color-props/v1",
    exportName: "ColorPropsV1",
  },
  {
    slug: "json-data-prop",
    templateId: "@m0saic-starter/props/json-data-prop/v1",
    exportName: "JsonDataPropV1",
  },
  {
    slug: "control-gallery",
    templateId: "@m0saic-starter/props/control-gallery/v1",
    exportName: "ControlGalleryV1",
  },
  {
    slug: "error-mosaic",
    templateId: "@m0saic-starter/props/error-mosaic/v1",
    exportName: "ErrorMosaicV1",
  },
];
