/**
 * `@m0saic-starter/controls/static-options/v1` — a closed set the editor can
 * SEE, and the difference between presenting one and enforcing one.
 *
 * ONE CONCEPT: `control.options` — the static option list. Declare rows of
 * `{ value, label, description? }` and the editor stops rendering a text
 * box: a `string` prop becomes a segmented pill row (≤5 options) or a
 * dropdown, and a `string[]` prop becomes toggle pills. The rows carry the
 * HUMAN half (labels, descriptions) so the value half can stay merely a
 * slug.
 *
 * THE DISTINCTION THAT BITES: `options` is PRESENTATION, `constraints.oneOf`
 * is VALIDATION, and they are independent.
 *
 *   - `preset` declares BOTH — the editor shows three pills AND the
 *     validator rejects anything else. A true closed set.
 *   - `tracks` declares options ONLY — the pills are a convenience, but any
 *     slug value renders fine (this template's own validation still checks
 *     shape). That looseness is deliberate: it is the same posture the
 *     connections chapter needs, where live upstream values can't be
 *     enumerated at publish time.
 *
 * Declare `oneOf` without `options` and you get validation with no picker;
 * `options` without `oneOf` and you get a picker with no fence. Choose per
 * prop, on purpose.
 */
export type StaticOptionsProps = {
    /** Export preset — options + oneOf: a TRUE closed set. */
    preset?: string;
    /** Included tracks — options only: pills as convenience, values open. */
    tracks?: string[];
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const PRESETS: {
    value: string;
    label: string;
    description: string;
}[];
export declare const TRACKS: {
    value: string;
    label: string;
}[];
export declare const StaticOptionsV1: import("@m0saic/types").MosaicTemplate<StaticOptionsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default StaticOptionsV1;
