/**
 * `@m0saic-starter/geometry/passthrough-donation/v1` — `0` is not a gap,
 * it's a donation.
 *
 * ONE CONCEPT: PASSTHROUGH SLOTS DONATE FORWARD. In `4(1,0,0,1)` there are
 * four slots but only TWO rendered tiles: the first `1` claims its single
 * slot (25%), then the two `0`s hand their slots to the NEXT claimant —
 * the final `1` renders 0+0+1 = three slots wide (75%).
 *
 * That's the entire mechanism behind weighted splits: a weight of N is
 * spelled as (N-1) passthroughs followed by one claimant, which is exactly
 * what `weightedSplit([1, 3], "col")` emits. This template writes the raw
 * string by hand so the donation is visible, and labels each rendered tile
 * with the slots it ended up owning.
 *
 * (`-` is the OTHER empty token, with the opposite meaning: a null claims
 * its space and paints nothing. The Learn page's fundamentals teach it
 * interactively; lattice-gutters' "split" mode shows nulls spelling gutters
 * in template code.)
 */
export type PassthroughDonationProps = {
    /** How many passthrough slots donate into the second tile (1-8). */
    donatedSlots?: number;
};
export declare const PassthroughDonationV1: import("@m0saic/types").MosaicTemplate<PassthroughDonationProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default PassthroughDonationV1;
