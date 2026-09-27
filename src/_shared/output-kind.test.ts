import { formatFor, hasMedia, mediaLooksLikeVideo } from "./output-kind";

describe("output-kind — what a template answers for its props", () => {
  it("names a video by extension, case-insensitively", () => {
    for (const p of ["/x/clip.mp4", "/x/Clip.MOV", "a.webm", "b.MKV", "c.gif"]) {
      expect(mediaLooksLikeVideo(p)).toBe(true);
    }
  });

  it("everything else is not a video — including empty, absent and extensionless", () => {
    for (const p of ["", "   ", "/x/photo.png", "/x/no-extension", ".", "/x/.hidden", undefined, null, 7]) {
      expect(mediaLooksLikeVideo(p as never)).toBe(false);
    }
  });

  it("hasMedia is about PRESENCE, not kind", () => {
    expect(hasMedia("/x/photo.png")).toBe(true);
    expect(hasMedia("")).toBe(false);
    expect(hasMedia("   ")).toBe(false);
    expect(hasMedia(undefined)).toBe(false);
  });

  it("formatFor gives the two containers a host can act on", () => {
    expect(formatFor(true)).toEqual({ format: { kind: "video", container: "mp4" } });
    expect(formatFor(false)).toEqual({ format: { kind: "image", container: "png" } });
  });
});
