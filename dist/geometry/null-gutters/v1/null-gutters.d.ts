/**
 * `@m0saic-starter/geometry/null-gutters/v1` — gutters are null TILES, not
 * margins.
 *
 * ONE CONCEPT: the `-` token claims its slots and paints NOTHING — the
 * document background shows through. That makes nulls the honest way to
 * spell gutters: `14(1,0,0,0,0,-,1,0,0,0,0,-,1,0)`-style rows where content
 * and gaps are all just weighted tiles on ONE split.
 *
 * Built with `weightedSplit`'s per-child claimants:
 *
 *   weightedSplit([8, 1, 8, 1, 8], "col", { claimants: ["1","-","1","-","1"] })
 *
 * Why not shrink each tile with margins instead? Because margin-as-split
 * (the `insetNode` trap) makes every margin a REAL split cell — and the
 * outside-in remainder then spreads INTO your margins and content
 * differently at every canvas: a layout that looks fine at 480px grows
 * lopsided at 290px. Null tiles are ordinary weights, so the remainder
 * rule treats content and gaps uniformly. (For pixel-exact gutters at any
 * canvas, the fiber-based `latticeCellInset` is the next lesson.)
 */
export type NullGuttersProps = {
    /** Content tiles (2-6). */
    tileCount?: number;
    /** Content weight per tile relative to a gutter weight of 1 (2-24). */
    tileWeight?: number;
    /** Tile fill (#rrggbb). */
    tileColor?: string;
};
export declare const NullGuttersV1: import("@m0saic/types").MosaicTemplate<NullGuttersProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NullGuttersV1;
