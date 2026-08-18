/**
 * `@m0saic-starter/controls/number-display/v1` — the stored unit and the
 * shown unit are different decisions.
 *
 * ONE CONCEPT: the number-display family — `unit`, `displayUnit`,
 * `lockDisplayUnit`, `step`. A duration prop stores milliseconds because
 * the engine thinks in ms; a human reads seconds. Declaring both keeps
 * each side honest:
 *
 *  - `unit: "ms"` names the CANONICAL unit — the number in props, files,
 *    and render is always this;
 *  - `displayUnit: "s"` makes the editor SHOW the converted value (2400
 *    stored renders as 2.4 in the field), with a unit chip the user can
 *    cycle through the family;
 *  - `lockDisplayUnit: true` (on `fadeMs` below) freezes that chip when a
 *    unit swap could silently rescale a small step into a giant value —
 *    the chip still shows the unit, it just stops being a toggle;
 *  - `step` is authored in the CANONICAL unit (step: 100 on an ms prop is
 *    a tenth-of-a-second arrow click, whatever the display shows).
 *
 * Render reads canonical ms and says so on the card — the display
 * conversion never leaks into values, which is the entire point: unit
 * presentation is editor UX; unit MEANING lives in the schema and the
 * stored number.
 */
export type NumberDisplayProps = {
    /** Hold per slide, stored in ms, displayed in seconds. */
    holdMs?: number;
    /** Crossfade, stored in ms, display LOCKED to ms. */
    fadeMs?: number;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const NumberDisplayV1: import("@m0saic/types").MosaicTemplate<NumberDisplayProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NumberDisplayV1;
