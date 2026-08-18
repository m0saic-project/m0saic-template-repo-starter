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
export const qualityRegistry: StarterRegistryEntry[] = [
  {
    slug: "layout-contract-card",
    templateId: "@m0saic-starter/quality/layout-contract-card/v1",
    exportName: "LayoutContractCardV1",
    title: "62 · Layout Contract Card",
    description:
      "Ratio invariants authored against LABELS, which survive every m0 the template regenerates — unlike tile order and stableKeys, which do not. Push the sidebar past 40% with the contract on and the render becomes the violation report, at exactly the canvas that broke.",
    tags: ["quality", "contracts", "lesson"],
  },
  {
    slug: "geometry-contract-card",
    templateId: "@m0saic-starter/quality/geometry-contract-card/v1",
    exportName: "GeometryContractCardV1",
    title: "63 · Geometry Contract Card",
    description:
      "A template computes rects in JS and throws the intent away at return — so a quantization squash reads as a healthy m0 and a wrong picture. Declare the intended box, select it by a computed stableKey, and prove it survived to the pixels at this canvas.",
    tags: ["quality", "contracts", "lesson"],
  },
  {
    slug: "below-the-floor",
    templateId: "@m0saic-starter/quality/below-the-floor/v1",
    exportName: "BelowTheFloorV1",
    title: "64 · Below the Floor",
    description:
      "A layout has two independent minimum sizes: feasibility (renders at all) and precision (looks right). One design, three states — clears both, clears only feasibility and quietly squashes, or falls through feasibility and is refused outright. The caption prints all three numbers at your canvas, so the loud failure and the silent one are told apart by arithmetic.",
    tags: ["quality", "feasibility", "lesson"],
  },
  {
    slug: "why-the-floors-cross",
    templateId: "@m0saic-starter/quality/why-the-floors-cross/v1",
    exportName: "WhyTheFloorsCrossV1",
    title: "65 · Why the Floors Cross",
    description:
      "Which floor is the one to watch, for layouts people actually build? Synthetic shapes show the mechanism: a title bar + six stat cards where one card is precision-high alone and six nested cross over to feasibility-high (safe minimum 680x100); a sidebar speced in design pixels (320 of 1440) that bakes a 1440-slot ruler into the m0; an even grid that stays at 12. Then the real thing, shipped as sidecars and rendered as wireframes: the kpi strip's flattened 22,988-char production m0 (feasibility 934x117 vs precision 193x121) and theming's (precision 1920x1080 vs feasibility 663x313). All floors are of the FLATTENED layout, the form render actually runs — read them live in Make's safe-minimum callout.",
    tags: ["quality", "feasibility", "lesson"],
  },
];
