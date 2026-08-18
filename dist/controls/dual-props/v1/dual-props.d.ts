/**
 * `@m0saic-starter/controls/dual-props/v1` — one knob for humans, one truth
 * for everyone.
 *
 * ONE CONCEPT: `ui.consumer` + `control.syncsTo` — the dual-prop pattern.
 * Sometimes the CANONICAL prop is the wrong control: `holdSec` (how long a
 * card holds) is what render needs, but people think "speed"; `reduceMotion`
 * is the precise flag, but people think "animate". Declare BOTH:
 *
 *  - the canonical props carry `ui.consumer: "agent"` — they are the hard
 *    form, pulled out of the human view into the panel's "Agent props"
 *    escape (raw, exact, still fully editable there);
 *  - the friendly props carry `ui.consumer: "human"` plus
 *    `control.syncsTo: [{ prop, map }]` — the editor shows the friendly
 *    dial, reads its position by INVERSE-mapping the canonical value, and
 *    writes changes back THROUGH the map. Maps: `linear` (ranges may
 *    invert — higher speed IS lower hold), `boolInvert`, `identity`.
 *
 * THE HUMAN KEY NEVER REACHES RENDER. `speed` and `animate` below are
 * editor-only: this render reads `holdSec` and `reduceMotion` and nothing
 * else — asserted in the test by passing bogus human values and getting an
 * identical document. One knob for humans, one truth for everyone: agents
 * and saved files speak canonical, dials stay friendly, and the two can
 * never disagree because only one of them is real.
 */
export type DualPropsProps = {
    /** CANONICAL: seconds each card holds. What render actually reads. */
    holdSec?: number;
    /** CANONICAL: precise motion flag. */
    reduceMotion?: boolean;
    /** HUMAN DIAL: speed 1-10, a derived view of holdSec. Never rendered. */
    speed?: number;
    /** HUMAN TOGGLE: animate, a derived view of !reduceMotion. Never rendered. */
    animate?: boolean;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const DualPropsV1: import("@m0saic/types").MosaicTemplate<DualPropsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default DualPropsV1;
