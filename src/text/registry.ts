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
    title: "Text, Three Ways",
    description:
      "The same word through all three text pipelines, side by side: drawtext (ffmpeg, expr-capable, host fonts), the svg rasterizer (bundled font baked to geometry), and mask-carved glyphs (text as a mask any source can wear).",
    tags: ["text", "rasterizer", "lesson"],
  },
];
