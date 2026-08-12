/**
 * `@m0saic-starter/media/image-card/v1` — one image, the whole media
 * pipeline.
 *
 * ONE CONCEPT: how a media prop becomes pixels. The prop value is a RAW
 * PATH STRING (the `picker: "file"` control fills it). The template does
 * NO I/O — the HOST probes the file and hands the metadata to render()
 * as `ctx.media[rawPath]`. The template then:
 *
 *   1. checks the probe (exists? is an image?),
 *   2. mints an asset key (`slugifyAssetKeyFromPath`),
 *   3. writes the manifest entry `{ kind: "file", path, mediaType }`,
 *   4. emits a `type: "media"` source pointing at that assetId.
 *
 * The `fit` prop shows the one placement decision every image needs:
 * "contain" letterboxes (whole image visible), "cover" fills (crops).
 * With no image picked, the card renders a friendly prompt — never a
 * dead preview.
 */
export type ImageCardProps = {
    /** The image file (picked in the sidebar; value = raw path). */
    image?: string;
    /** How the image meets its cell: contain (letterbox) or cover (crop). */
    fit?: "contain" | "cover";
};
export declare const ImageCardV1: import("@m0saic/types").MosaicTemplate<ImageCardProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ImageCardV1;
