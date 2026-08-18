/**
 * `@m0saic-starter/quality/why-the-floors-cross/v1` — which floor runs high
 * for the layouts people actually build, shown twice: once with synthetic
 * shapes where the numbers are legible, and once with REAL production m0.
 *
 * ONE CONCEPT: lesson 69 showed the two floors and how each fails. This one
 * shows which number is the one to watch — and that ordinary, non-math
 * design decisions push it into the hundreds. Five layouts, two registers:
 *
 * SYNTHETIC (the mechanism, with a burned caption):
 *
 *   DASHBOARD      a title bar and six stat cards — card background, icon,
 *                  label, value, delta, with pads and gutters. One card
 *                  ALONE is precision-high (prec 100 vs feas 89). Six in a
 *                  strip and feasibility multiplies straight past it:
 *                  680x100 safe minimum. THE FLOORS CROSS AT THE NESTING
 *                  STEP — the anatomy that was a precision problem alone
 *                  becomes a feasibility problem in a strip.
 *
 *   SIDEBAR PAGE   a sidebar speced the way designers spec it: in DESIGN
 *                  PIXELS, 320 of a 1440 frame, carried into weights as-is.
 *                  Ratio-from-pixels bakes the design resolution into the
 *                  ruler: precision 1440, renders at 641 — a 1280 canvas is
 *                  already silently off. Nothing about "320 of 1440" was a
 *                  math decision; the floor came anyway.
 *
 *   EVEN GRID      a twelve-column wall. Floors stay at 12 — even splits
 *                  are the only shape that stays cheap.
 *
 * REAL (captured production m0, shipped bare as a sidecar and rendered as a
 * wireframe — one color tile per claim; no caption is burned in, because
 * appending an overlay to these roots would be an illegal overlay chain.
 * Read the numbers in Make's safe-minimum callout, which measures the same
 * flattened string this template ships):
 *
 *   REAL KPI STRIP `@m0saic/hero/ffmpeg-pulse/kpi-overview/v1`, flattened
 *                  at its 1920x1080 defaults: 22,988 chars, 74 claims.
 *                  Feasibility 934x117 vs precision 193x121 — the dashboard
 *                  rule at production scale. Each KPI tile is fine alone at
 *                  193x38; nested into the strip its needs multiply.
 *
 *   REAL THEMING   `@m0saic/theming/v1`, flattened: 14,676 chars, 45
 *                  claims. Precision 1920x1080 vs feasibility 663x313 — a
 *                  design positioned at full canvas resolution renders at a
 *                  third of it and is only pixel-true at 1920. On a 1280
 *                  canvas it is already silently off.
 *
 * THE FLOORS BELONG TO THE SHAPE, NOT THE CANVAS — resize and the numbers
 * hold still. And they are the floors of the FLATTENED layout, the form
 * render actually runs: the real sidecars ARE flattened output (their
 * nested children already merged), and the synthetic strings are authored
 * in that same form. A top-level m0 with unflattened children understates
 * its floors until flattening surfaces them.
 *
 * (Why they differ, in one breath: feasibility is set by the smallest
 * detail on screen and multiplies as widgets nest into slots; precision is
 * set by the finest ruler any single split measures with, however little it
 * draws. Neither bounds the other — take the per-axis max, `recommendedMin`.)
 *
 * DON'T GUESS — MEASURE. Every number above is `evaluateM0` on the shipped
 * string, asserted in this template's tests so the citations cannot drift.
 */
export type FloorsCrossLayout = "dashboard" | "sidebar-page" | "even-grid" | "real-kpi-strip" | "real-theming";
export type WhyTheFloorsCrossProps = {
    /** Which layout ships. */
    layout?: FloorsCrossLayout;
    /** Block fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const WhyTheFloorsCrossV1: import("@m0saic/types").MosaicTemplate<WhyTheFloorsCrossProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default WhyTheFloorsCrossV1;
