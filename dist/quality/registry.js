"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualityRegistry = void 0;
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
exports.qualityRegistry = [
    {
        slug: "layout-contract-card",
        templateId: "@m0saic-starter/quality/layout-contract-card/v1",
        exportName: "LayoutContractCardV1",
        title: "58 · Layout Contract Card",
        description: "Ratio invariants authored against LABELS, which survive every m0 the template regenerates — unlike tile order and stableKeys, which do not. Push the sidebar past 40% with the contract on and the render becomes the violation report, at exactly the canvas that broke.",
        tags: ["quality", "contracts", "lesson"],
    },
    {
        slug: "geometry-contract-card",
        templateId: "@m0saic-starter/quality/geometry-contract-card/v1",
        exportName: "GeometryContractCardV1",
        title: "59 · Geometry Contract Card",
        description: "A template computes rects in JS and throws the intent away at return — so a quantization squash reads as a healthy m0 and a wrong picture. Declare the intended box, select it by a computed stableKey, and prove it survived to the pixels at this canvas.",
        tags: ["quality", "contracts", "lesson"],
    },
];
