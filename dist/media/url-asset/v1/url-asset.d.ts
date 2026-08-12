/**
 * `@m0saic-starter/media/url-asset/v1` — remote media, honestly labeled.
 *
 * ONE CONCEPT: the `{ kind: "url" }` asset. A manifest entry can point at
 * a remote file instead of a local path — the HOST fetches it at render
 * time (the template still does no I/O). The trade is reproducibility:
 * a URL render depends on the network, the server, and whatever bytes
 * live there TODAY. The caveats, which this template states on canvas:
 *
 *   - offline hosts FAIL the render (no fetch, no pixels);
 *   - the bytes can change under you — same doc, different output;
 *   - prefer `{ kind: "file" }` for anything you need reproducible;
 *     URLs are for genuinely remote, genuinely current sources.
 *
 * There is no probe for an unfetched URL, so the template declares the
 * media's kind itself and cannot print probed dimensions — one more cost
 * of going remote, stated on the caption.
 */
export type UrlAssetProps = {
    /** Remote image URL (https). Empty renders the explainer card. */
    url?: string;
};
export declare const UrlAssetV1: import("@m0saic/types").MosaicTemplate<UrlAssetProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default UrlAssetV1;
