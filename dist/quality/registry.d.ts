import type { StarterRegistryEntry } from "../registry-types";
/**
 * Chapter registry: `quality` — array order is the teaching order.
 *
 * How to know a template is CORRECT, not just that it rendered. Two contract
 * tripwires that cost nothing until you turn them on.
 *
 * They are deliberately adjacent because their identities differ and the
 * difference is the lesson: a LABEL survives every m0 the template
 * regenerates and carries canvas-independent ratios; a STABLEKEY addresses
 * one specific string exactly and carries pixel assertions.
 *
 * Deliberately NOT here: a perf-windowing lesson. Declaring a lifetime
 * (`overlay.window`) is a real rule, but its whole effect is invisible in the
 * output — a template could only assert the cost changed, never show it. It
 * lives in `docs/style.md` as prose instead, which is the honest home for a
 * rule with nothing to look at.
 */
export declare const qualityRegistry: StarterRegistryEntry[];
