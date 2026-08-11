/**
 * `@m0saic-starter/props/control-gallery/v1` — the `meta` surface, one knob
 * per affordance.
 *
 * ONE CONCEPT: `meta` is how a prop shapes its CONTROL. The type picks the
 * widget; meta refines it:
 *   - `control.placeholder` — ghost text in an empty field.
 *   - `flavor: "url"`       — semantic hint; the editor renders a URL-ish
 *                             field (still a plain string on the wire).
 *   - `constraints.min/max` + `control.step` — a bounded, stepped number.
 *   - `constraints.oneOf`   — an enum select.
 *   - `ui.label`            — the human name over the raw prop key.
 *
 * THE REAL DEMO IS THE SIDEBAR. The canvas just renders the spec sheet —
 * each prop, its declaration, and its current value — so the form on the
 * right and the sheet on the left describe each other.
 */
export type ControlGalleryProps = {
    /** Ghost text demo (ASCII, up to 24 chars). */
    nickname?: string;
    /** flavor:"url" demo. */
    homepage?: string;
    /** Bounded + stepped number demo (0-100, step 5). */
    strength?: number;
    /** Enum select demo. */
    season?: "spring" | "summer" | "autumn" | "winter";
};
export declare const ControlGalleryV1: import("@m0saic/types").MosaicTemplate<ControlGalleryProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ControlGalleryV1;
