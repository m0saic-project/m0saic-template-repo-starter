/**
 * `@m0saic-starter/data/sidecar-json/v1` — a second deliverable, in JSON.
 *
 * ONE CONCEPT: `doc.sidecars` writes FILES next to the render. Each key
 * becomes `{output-basename}.{key}.json`, so a template can ship machine-
 * readable facts alongside the pixels without a second render.
 *
 * TWO HALVES, BOTH REQUIRED:
 *
 *   - `sidecarsSchema` on the TEMPLATE declares which sidecars exist and
 *     what they mean. It is the contract a host reads.
 *   - `sidecars` on the DOCUMENT carries the values for this render.
 *
 * Declare without attaching and no file appears; attach without declaring and
 * nobody knows the file was coming.
 *
 * SIDECARS ARE NOT `variables`. A data source is an IN-MEMORY channel for the
 * next template in a chain; a sidecar is a file on disk for whatever comes
 * after m0saic — a build step, a CMS, a person. The same payload often goes
 * both ways, which is exactly what `data/fixture-fetcher` does.
 *
 * NOT IN DESIGN MODE. Sidecars are suppressed while the editor is drawing
 * previews — they belong to a real render with a real output path. That is
 * why a sidecar must never be the only place a fact lives.
 */
export type SidecarJsonProps = {
    /** Free-text note stored in the sidecar. */
    note?: string;
    /** Include per-cell geometry in the sidecar. */
    includeGeometry?: boolean;
};
export declare const SidecarJsonV1: import("@m0saic/types").MosaicTemplate<SidecarJsonProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default SidecarJsonV1;
