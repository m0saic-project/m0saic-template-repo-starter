/**
 * `@m0saic-starter/media/folder-contact-strip/v1` — a folder of images,
 * one prop.
 *
 * ONE CONCEPT: `type: "media[]"` + `picker: "folder"`. The control lets
 * the user pick a FOLDER; the prop arrives as an ARRAY of raw paths (the
 * host enumerates and probes each file). The template maps the array:
 * every path gets its own probe check, its own slugified asset key, its
 * own manifest entry, its own media source — and the layout resplits to
 * the count. A contact strip is the smallest honest shape for "N images
 * arrived".
 */
export type FolderContactStripProps = {
    /** Images from a folder (the host enumerates; value = raw paths). */
    images?: string[];
};
export declare const FolderContactStripV1: import("@m0saic/types").MosaicTemplate<FolderContactStripProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default FolderContactStripV1;
