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

/** Containers m0saic treats as moving footage. */
const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi", ".gif"]);

/** Does this media path name a VIDEO? Empty, absent or unknown ⇒ no. */
export function mediaLooksLikeVideo(media: unknown): boolean {
  if (typeof media !== "string") return false;
  const path = media.trim().toLowerCase();
  const dot = path.lastIndexOf(".");
  return dot > 0 && VIDEO_EXTS.has(path.slice(dot));
}

/** True when a media path is set to anything at all. */
export function hasMedia(media: unknown): boolean {
  return typeof media === "string" && media.trim().length > 0;
}

export const VIDEO_FORMAT = { kind: "video", container: "mp4" } as const;
export const IMAGE_FORMAT = { kind: "image", container: "png" } as const;

/** The two-line body of most `resolveOutputHints`: video when it moves. */
export function formatFor(moving: boolean): { format: typeof VIDEO_FORMAT | typeof IMAGE_FORMAT } {
  return { format: moving ? VIDEO_FORMAT : IMAGE_FORMAT };
}
