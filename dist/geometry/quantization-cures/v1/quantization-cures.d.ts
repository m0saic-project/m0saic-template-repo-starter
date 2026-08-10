/**
 * `@m0saic-starter/geometry/quantization-cures/v1` — the geometry chapter's
 * capstone: one 12×3 gridded design, the quantization disease, and every
 * cure in the toolbox, one enum flip apart.
 *
 * ONE CONCEPT: quantization SPREAD is what you get when a ratio string
 * meets a canvas that doesn't divide it — and each cure trades something
 * different to get exactness back.
 *
 *   - "naive" (the disease): gutters spelled as ratio weights (1 against
 *     24). Whatever the canvas, each gutter quantizes independently to N
 *     or N+1 px — and at 3-5px line weights a 1px wobble reads as a
 *     25-33% difference. Thin lines are quantization's magnifying glass.
 *   - "inset" (recover): the m0 stays a PLAIN grid; `latticeCellInset`
 *     carves exact G-px gutters as per-cell placement insets. The ±1px
 *     jitter moves into cell widths (where equal grids carry it anyway).
 *     String stays tiny; precision floor stays at the grid's own scale;
 *     survives nesting. (Deep dive: geometry/lattice-gutters.)
 *   - "snap" (refuse): `snapGridFit` snaps the whole grid into the largest
 *     quantization-FREE inner rect. Every cell identical, every gutter
 *     identical — the cost is coverage: a margin handed back to the
 *     canvas.
 *   - "rects" (bake): `placeRects` pins every cell at exact pixels for
 *     THIS canvas. Perfect today, meaningless nested tomorrow (see
 *     geometry/ratio-vs-absolute) — and the string carries every number.
 *
 * The caption prints each mode's receipts (measured gutter min-max, chars,
 * coverage); the Geometry view's m0 readout shows what each cure costs in
 * string form.
 */
export type QuantizationCuresProps = {
    /** Which spelling of the same design to render. */
    method?: "naive" | "inset" | "snap" | "rects";
    /** Checkerboard accent fill (#rrggbb). */
    checkerColor?: string;
};
export declare const QuantizationCuresV1: import("@m0saic/types").MosaicTemplate<QuantizationCuresProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default QuantizationCuresV1;
