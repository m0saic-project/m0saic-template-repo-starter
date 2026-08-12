/**
 * `@m0saic-starter/compose/reduce-to-one/v1` — the same picture, spelled two
 * ways, with the receipts printed on it.
 *
 * ONE CONCEPT: "reduce to 1" is a refactor. When a subtree gets dense or
 * precision-hungry, move it into a child mosaic and the parent collapses to
 * a single frame. The pixels don't change. What changes is the size of the
 * string the parent has to carry, and — the real prize — which precision
 * tier each half lives in.
 *
 * Flip `mode` and read the caption:
 *
 *   - "flat": the whole grid is spelled inline. The parent's m0 grows with
 *     the density, every cell competing for the same quantization budget as
 *     the chrome around it.
 *   - "reduced": the parent is ONE cell plus a `children` entry. The grid
 *     still renders, at the same density, from a document that owns its own
 *     coordinate space and its own declared size.
 *
 * WHEN this is worth it: high DSL count in the dense part, chrome that wants
 * to stay resolution-independent, or a subtree whose pixel math you want
 * isolated from everything else. WHEN IT ISN'T: a cheap subtree — you have
 * traded one string for one extra encode pass, and the pass isn't free.
 *
 * The next move after this one is baking: if the reduced child is also
 * IDENTICAL on every render (no props, no data), pre-render it once and
 * reference a flat asset instead. Reduce first, bake last — and only once
 * the look is locked, because baking freezes it.
 */
export type ReduceToOneProps = {
    /** How the same picture is spelled. */
    mode?: "flat" | "reduced";
    /** Grid density: N×N cells either way. */
    density?: number;
};
export declare const ReduceToOneV1: import("@m0saic/types").MosaicTemplate<ReduceToOneProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ReduceToOneV1;
