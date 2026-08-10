/**
 * `@m0saic-starter/geometry/lattice-gutters/v1` — pixel-exact gutters at
 * ZERO string cost, with the expensive spelling one toggle away.
 *
 * ONE CONCEPT: base × fiber. The BASE m0 stays a plain gutterless grid —
 * tiny, composable, quantization-friendly. The gutters live entirely in the
 * FIBER: `latticeCellInset` computes, per cell, a `placement.inset` that
 * shrinks the painted content onto a target lattice with EXACTLY `g` px
 * between neighbors and exactly `m` px of outer margin — at every canvas.
 *
 * How the exactness survives rounding: each lattice line fits a feasible
 * window derived from the raw cells beside it (`[rawStart, rawEnd + g]`) —
 * and a gutter is exactly `g` wherever its line lands, because one span
 * ends at `X - g` and the next starts at `X`. So the raw split's +-1px
 * jitter lands in CELL WIDTHS (which equal grids carry anyway), never in
 * the gutters. The library still reports `maxClampPx`/`clampedEdges` for
 * degenerate hand-fed lattices, and this template prints it if it ever
 * fires — for any real grid it reads zero.
 *
 * The `gutterMode` toggle renders the SAME target lattice both ways:
 *
 *   - "inset" (default): base = plain grid, gutters as leaf-private insets.
 *     The string stays a handful of characters; precision stays at the
 *     grid's own tiny floor.
 *   - "split": gutters and margins spelled INTO the split as real `-`
 *     cells, weighted in raw pixels. Same pixels on screen — but now the
 *     string carries THIS canvas's numbers, its length balloons, and its
 *     precision floor jumps to near-canvas scale. Precision is hereditary,
 *     so any parent that nests the split spelling inherits that floor.
 *
 * The caption band prints the receipts for the current mode: character
 * count and measured precision floor. Flip the toggle and watch both move.
 *
 * (The deprecated `gridCellInset` did the inset approach approximately —
 * ideal-vs-real cells, no half-pixel centering — and wobbled.
 * `latticeCellInset` is the replacement; don't reach for the old one.)
 */
export type LatticeGuttersProps = {
    /** Grid rows (2-4). */
    rows?: number;
    /** Grid columns (2-6). */
    cols?: number;
    /** Gutter between cells, px (2-48). */
    gutterPx?: number;
    /** Outer margin, px (0-64). */
    marginPx?: number;
    /** How the gutters are spelled: leaf-private insets vs real split cells. */
    gutterMode?: "inset" | "split";
    /** Tile fill (#rrggbb). */
    tileColor?: string;
};
export declare const LatticeGuttersV1: import("@m0saic/types").MosaicTemplate<LatticeGuttersProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default LatticeGuttersV1;
