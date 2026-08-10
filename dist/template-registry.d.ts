import type { StarterChapter, StarterRegistryEntry } from "./registry-types";
/**
 * The whole curriculum, chapter by chapter. ORDER IS THE CURRICULUM —
 * chapters here follow TEMPLATE_PACKS (src/repo.ts), and each chapter's
 * entries follow that chapter's teaching order. The manifest generator
 * flattens this verbatim into template-manifest.json, so what you read in
 * CURRICULUM.md, what the app lists, and what this file says can't drift
 * from each other (tools/check-deps.mjs lints the triangle).
 */
export declare const CHAPTERS: StarterChapter[];
/** Flat view over every chapter, in curriculum order. */
export declare const templateRegistry: StarterRegistryEntry[];
