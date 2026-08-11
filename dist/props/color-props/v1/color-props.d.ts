/**
 * `@m0saic-starter/props/color-props/v1` — the two color controls, declared
 * right.
 *
 * ONE CONCEPT: color props DECLARE THEMSELVES. A bare `type: "string"` prop
 * renders as a text field; add `constraints.isColor` + `control.colorPicker`
 * and the sidebar shows a real swatch. The same declaration on a
 * `type: "string[]"` prop gets the color-LIST control — one swatch row per
 * entry, add/remove/reorder. (This repo's conventions test enforces the
 * declaration on every color-typed prop, scalar or list.)
 *
 *   - `panelColor` (scalar)   → the big panel.
 *   - `palette`    (string[]) → the swatch column, one band per entry.
 */
export type ColorPropsProps = {
    /** The big panel's fill (#rrggbb). */
    panelColor?: string;
    /** The swatch column (1-8 entries, #rrggbb each). */
    palette?: string[];
};
export declare const ColorPropsV1: import("@m0saic/types").MosaicTemplate<ColorPropsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ColorPropsV1;
