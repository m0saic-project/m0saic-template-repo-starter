import type { StarterChapter, StarterRegistryEntry } from "./registry-types";
import { basicsRegistry } from "./basics/registry";
import { geometryRegistry } from "./geometry/registry";
import { propsRegistry } from "./props/registry";
import { mediaRegistry } from "./media/registry";
import { textRegistry } from "./text/registry";
import { masksRegistry } from "./masks/registry";
import { composeRegistry } from "./compose/registry";
import { pipelinesRegistry } from "./pipelines/registry";
import { dataRegistry } from "./data/registry";

/**
 * The whole curriculum, chapter by chapter. ORDER IS THE CURRICULUM —
 * chapters here follow TEMPLATE_PACKS (src/repo.ts), and each chapter's
 * entries follow that chapter's teaching order. The manifest generator
 * flattens this verbatim into template-manifest.json, so what you read in
 * CURRICULUM.md, what the app lists, and what this file says can't drift
 * from each other (tools/check-deps.mjs lints the triangle).
 */
export const CHAPTERS: StarterChapter[] = [
  { pack: "basics", entries: basicsRegistry },
  { pack: "geometry", entries: geometryRegistry },
  { pack: "props", entries: propsRegistry },
  { pack: "media", entries: mediaRegistry },
  { pack: "text", entries: textRegistry },
  { pack: "masks", entries: masksRegistry },
  { pack: "compose", entries: composeRegistry },
  { pack: "pipelines", entries: pipelinesRegistry },
  { pack: "data", entries: dataRegistry },
];

/** Flat view over every chapter, in curriculum order. */
export const templateRegistry: StarterRegistryEntry[] = CHAPTERS.flatMap(
  (chapter) => chapter.entries,
);
