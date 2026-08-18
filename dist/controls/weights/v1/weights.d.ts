/**
 * `@m0saic-starter/controls/weights/v1` — a distribution the user drags, not
 * a set of numbers the user types.
 *
 * ONE CONCEPT: `flavor: "weights"`. A `number[]` prop plus
 * `control.weights.labels` (a FIXED, schema-declared label set) renders as
 * an auto-balancing slider group: drag one weight up and the others give
 * way, the group holding a constant total of 100. One weight per label,
 * same order — position IS the pairing, which is why the label set lives in
 * the SCHEMA, not the value.
 *
 * The value contract is forgiving by design: the field normalizes whatever
 * arrives (stale lengths, hand-typed numbers that don't sum to 100) into an
 * even-handed distribution rather than erroring. Render mirrors that
 * posture — normalize, then draw — because a template must treat a
 * hand-authored file exactly like a slider-dragged one.
 *
 * Render is the honest visualization: the weights ARE the layout. The bands
 * below are a weightedSplit fed directly by the prop — drag a slider, move
 * a wall.
 */
export type WeightsProps = {
    /** The mix: one weight per label, kept summing to 100 by the control. */
    mix?: number[];
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** The fixed label set — schema-owned; the value never carries names. */
export declare const MIX_LABELS: string[];
/** Normalize to one finite non-negative weight per label, summing to 100. */
export declare function parseMix(raw: WeightsProps["mix"]): number[];
export declare const WeightsV1: import("@m0saic/types").MosaicTemplate<WeightsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default WeightsV1;
