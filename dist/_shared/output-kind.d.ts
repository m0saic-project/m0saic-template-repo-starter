/**
 * "Image or video?" — answered from the PROPS, for `resolveOutputHints`.
 *
 * A template that accepts media has no fixed answer: hand it a clip and it makes
 * a video, hand it a still (or nothing) and it makes an image. Declaring one kind
 * statically is wrong for half its inputs by construction, and the host then has
 * to guess — which is exactly the guess that got `carved-type` wrong in Make
 * (founder, 2026-09-26). A template says it itself, per props, with these.
 *
 * ⚠️ `resolveOutputHints` must be PURE and prop-only: it runs before any probe,
 * so `ctx.media` does not exist yet and the path's extension is the only evidence
 * available. That is a deliberate limit, not a shortcut — a wrong extension is
 * the user's to fix, and the Output Type override is always there.
 */
/** Does this media path name a VIDEO? Empty, absent or unknown ⇒ no. */
export declare function mediaLooksLikeVideo(media: unknown): boolean;
/** True when a media path is set to anything at all. */
export declare function hasMedia(media: unknown): boolean;
export declare const VIDEO_FORMAT: {
    readonly kind: "video";
    readonly container: "mp4";
};
export declare const IMAGE_FORMAT: {
    readonly kind: "image";
    readonly container: "png";
};
/** The two-line body of most `resolveOutputHints`: video when it moves. */
export declare function formatFor(moving: boolean): {
    format: typeof VIDEO_FORMAT | typeof IMAGE_FORMAT;
};
