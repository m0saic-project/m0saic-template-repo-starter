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
    title: "32 · Text, Three Ways",
    description:
      "The same word through all three text pipelines, side by side: drawtext (ffmpeg, expr-capable, host fonts), the svg rasterizer (bundled font baked to geometry), and mask-carved glyphs (text as a mask any source can wear).",
    tags: ["text", "rasterizer", "lesson"],
  },
  {
    slug: "fit-text",
    templateId: "@m0saic-starter/text/fit-text/v1",
    exportName: "FitTextV1",
    title: "33 · Fit Text",
    description:
      "Nothing soft-wraps — fitting is the template's job. One box, three strategies (wrap the block, force one line, skip fitting and clip), and a caption printing the measured width against the box.",
    tags: ["text", "layout", "lesson"],
  },
  {
    slug: "count-up",
    templateId: "@m0saic-starter/text/count-up/v1",
    exportName: "CountUpV1",
    title: "34 · Count Up",
    description:
      "A drawtext counter ramping 0 → value over the clip: content.kind \"expr\" + eval \"frame\" + renderMode \"video\", the three fields that must agree. Flip Freeze as a still to see the quiet failure.",
    tags: ["text", "expr", "animation", "lesson"],
  },
  {
    slug: "carved-type",
    templateId: "@m0saic-starter/text/carved-type/v1",
    exportName: "CarvedTypeV1",
    title: "35 · Carved Type",
    description:
      "The word becomes an inline-mask and the picture plays through it: textToPath makes glyphs into a path, the path clips an ordinary media source, and the source underneath can be anything.",
    tags: ["text", "masks", "media", "lesson"],
  },
];
