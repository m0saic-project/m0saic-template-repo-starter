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
    title: "Typed Props Tour",
    description:
      "One prop of each scalar type — string, number, boolean, enum — each visibly driving the render, receipts on the caption. The schema picks the controls; render() is the gate.",
    tags: ["props", "lesson"],
  },
  {
    slug: "seeded-shuffle",
    templateId: "@m0saic-starter/props/seeded-shuffle/v1",
    exportName: "SeededShuffleV1",
    title: "Seeded Shuffle",
    description:
      "Randomness the m0saic way: a REQUIRED seed through mulberry32 — identical props render byte-identical documents, and the caption prints the deal.",
    tags: ["props", "determinism", "lesson"],
  },
  {
    slug: "color-props",
    templateId: "@m0saic-starter/props/color-props/v1",
    exportName: "ColorPropsV1",
    title: "Color Props",
    description:
      "Color props declare themselves: isColor + colorPicker gives the scalar a swatch and the string[] the color-list control. Panel beside palette column.",
    tags: ["props", "color", "lesson"],
  },
  {
    slug: "json-data-prop",
    templateId: "@m0saic-starter/props/json-data-prop/v1",
    exportName: "JsonDataPropV1",
    title: "JSON Data Prop",
    description:
      "Structured data through one type:\"json\" prop — collect-ALL validation with remedies, then the records become geometry: one proportional bar per row.",
    tags: ["props", "data", "lesson"],
  },
  {
    slug: "control-gallery",
    templateId: "@m0saic-starter/props/control-gallery/v1",
    exportName: "ControlGalleryV1",
    title: "Control Gallery",
    description:
      "The meta surface, one knob per affordance: placeholder, flavor:\"url\", bounded+stepped numbers, enum select, ui.label. The real demo is the sidebar.",
    tags: ["props", "controls", "lesson"],
  },
  {
    slug: "error-mosaic",
    templateId: "@m0saic-starter/props/error-mosaic/v1",
    exportName: "ErrorMosaicV1",
    title: "Error Mosaic",
    description:
      "Failing on-canvas, usefully: collect EVERY problem with a remedy and return makeErrorMosaic — a renderable report card instead of a dead preview.",
    tags: ["props", "errors", "lesson"],
  },
];
