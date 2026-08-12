/**
 * `@m0saic-starter/compose/camera-follow/v1` — a camera that walks a layout,
 * built from rects and times instead of hand-written motion.
 *
 * ONE CONCEPT: `effects.camera` is a crop window over a source — zoom, plus a
 * focus point that ffmpeg re-evaluates per frame. You never animate pixels;
 * you describe WHERE to look and WHEN, and `followCamera` compiles that into
 * the two focus expressions:
 *
 *   followCamera(targets, frameW, frameH, zoom, pullBack?) → MosaicCamera
 *
 * Each target is `{ rect, atSec }` — a box in the SOURCE's own coordinate
 * space, and the moment the camera should be settled on it. The helper turns
 * rect centers into focus keyframes, eases between them, and (with
 * `pullBack`) eases back to the full view at the end and holds there.
 *
 * Three facts worth carrying away:
 *
 *   - `focusX` / `focusY` come back as EXPRESSION STRINGS, not numbers. The
 *     walk lives in ffmpeg, which is why the debug rects below are drawn per
 *     TARGET (a static rect per settle) rather than per frame. With
 *     `pullBack` the `zoom` field becomes an expression too — it holds, eases
 *     to 1, and holds the full view — so nothing about a camera is safely
 *     assumed to be a number.
 *   - Rects are in the source's space. That is why the world here is a CHILD
 *     mosaic with a declared `size`: a coordinate space you own beats
 *     guessing where a cell landed.
 *   - `zoom ≤ 1` returns `undefined` — no camera, not a broken one. A
 *     template must handle that instead of assuming a camera came back.
 *
 * `showViewport` draws what the camera will frame, using the same
 * `cameraViewportRect` math a debugger would: window = frame/zoom, top-left
 * = focus·(frame − window). The frames are one masked tile carrying a hollow
 * rect per target — outer subpath clockwise, inner counter-clockwise, which
 * is the winding rule from masks/path-mask doing real work.
 */
export type CameraFollowProps = {
    /** Camera zoom. 1 means no camera at all. */
    zoom?: number;
    /** Ease back to the full view at the end and hold there. */
    pullBack?: boolean;
    /** Draw the viewport rect the camera will frame at each target. */
    showViewport?: boolean;
};
export declare const CameraFollowV1: import("@m0saic/types").MosaicTemplate<CameraFollowProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CameraFollowV1;
