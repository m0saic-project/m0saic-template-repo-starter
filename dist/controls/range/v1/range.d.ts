/**
 * `@m0saic-starter/controls/range/v1` — a number that is allowed to be a
 * RANGE, and the three intents the value can carry.
 *
 * ONE CONCEPT: `flavor: "range"`. Some knobs aren't one number — "hold each
 * slide 4 seconds" sometimes wants to be "hold each slide 3 to 6 seconds,
 * vary it". The range flavor gives ONE prop three user intents, readable
 * off the value shape:
 *
 *   4                        — flat: use exactly this value
 *   { low: 3, high: 6 }      — range: sample fresh per use
 *   { low: 3, high: 6,
 *     once: true }           — range, picked once: sample ONE value, reuse it
 *
 * `collapsible: true` renders the flat/range toggle; `allowOnce: true` adds
 * the pick-once toggle, labeled by `onceLabel`. The control records INTENT
 * only — what a "use" means (per slide? per render? per beat?) belongs to
 * the template, and `once: false` is never written (the key is simply
 * absent).
 *
 * This render VISUALIZES the intent rather than sampling it — a
 * deterministic template with no seed prop must not roll dice (the
 * seeded-shuffle lesson owns that move). A consumer that samples would
 * combine this control with a seed prop and derive per-use values from
 * (seed, use-index).
 */
export type HoldValue = number | {
    low: number;
    high: number;
    once?: true;
};
export type RangeProps = {
    /** Seconds each slide holds — flat, range, or range-picked-once. */
    hold?: HoldValue;
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export type ParsedHold = {
    intent: "flat";
    value: number;
} | {
    intent: "range";
    low: number;
    high: number;
    once: boolean;
};
/** Normalize the three legal shapes; reject everything else loudly. */
export declare function parseHold(raw: RangeProps["hold"]): ParsedHold;
export declare const RangeV1: import("@m0saic/types").MosaicTemplate<RangeProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default RangeV1;
