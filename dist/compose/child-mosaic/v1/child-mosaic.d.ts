/**
 * `@m0saic-starter/compose/child-mosaic/v1` — a whole document inside one
 * tile.
 *
 * ONE CONCEPT: `children` is a map of complete `MosaicDocument`s, and a
 * `{ type: "mosaic", ref }` source says "this tile's content is that
 * document". Evaluation is BOTTOM-UP: every child renders first, into its
 * own framebuffer, and the parent then treats the result as media.
 *
 * Two consequences, both load-bearing:
 *
 *   1. THE PARENT'S m0 NEVER GROWS. The DSL is shape; `children` is
 *      content. Turn the child's grid from 2×2 to 5×5 and the parent's
 *      string is still `2(1,1)` — the complexity moved a level down instead
 *      of into the string. (That is also the whole trick behind
 *      compose/reduce-to-one.)
 *   2. A finite framebuffer CLIPS. Anything the child paints past its own
 *      edge has nowhere to land, which is why wrapping a moving overlay in a
 *      child is the structural fix for pixels that bleed out of their cell.
 *
 * And one rule that only bites procedural children (lavfi / text / masks —
 * no media inside to measure): the child's aspect is inferred, and with
 * nothing to infer FROM it falls back to the parent tile's shape. Declare
 * `size` on the child and the engine trusts it as the natural aspect, then
 * fits it into the tile like any other media. Flip `Declare child size` and
 * watch square cells stop being square.
 */
export type ChildMosaicProps = {
    /** The child's grid: N×N cells, all inside ONE parent tile. */
    childGrid?: number;
    /** Give the child its own square `size` (its only aspect signal). */
    declareChildSize?: boolean;
};
export declare const ChildMosaicV1: import("@m0saic/types").MosaicTemplate<ChildMosaicProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ChildMosaicV1;
