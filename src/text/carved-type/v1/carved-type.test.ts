import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CarvedTypeV1 } from "./carved-type";

const FRAME = "assets/media/bbb-frame-960x540.jpg";
const CLIP = "assets/media/bbb-2s.mp4";
const mediaCtx = () =>
  targetCtx(1280, 720, {
    media: {
      [FRAME]: { kind: "image", width: 960, height: 540 },
      [CLIP]: { kind: "video", width: 640, height: 360, durationMs: 2000 },
    } as never,
  });

type Carved = {
  type: string;
  mediaType?: string;
  placement?: { fit?: string };
  mask?: { kind: string; localPath: string; bounds: { width: number; height: number } };
};

const carvedOf = (doc: { sources?: unknown[] }): Carved =>
  (doc.sources ?? [])[0] as Carved;

describe("@m0saic-starter/text/carved-type/v1", () => {
  it("carves the word into an inline-mask authored against the tile box", async () => {
    const doc = asDocument(await CarvedTypeV1.render({ word: "MOSAIC" }, targetCtx(1280, 720)));
    const mask = carvedOf(doc).mask;
    expect(mask?.kind).toBe("inline-mask");
    expect(mask?.localPath.length).toBeGreaterThan(50); // real glyph outlines
    // The tile is everything above the caption band — bounds must match it,
    // or the letters stretch (geometry/mask-in-a-cell).
    expect(mask?.bounds).toEqual({ x: 0, y: 0, width: 1280, height: 600 });
  });

  it("the SAME mask rides whatever source is underneath", async () => {
    const flat = asDocument(await CarvedTypeV1.render({ word: "M0" }, targetCtx(1280, 720)));
    const shot = asDocument(await CarvedTypeV1.render({ word: "M0", media: FRAME }, mediaCtx()));

    expect(carvedOf(flat).type).toBe("lavfi");
    expect(carvedOf(shot).type).toBe("media");
    // Identical silhouette — only the wearer changed.
    expect(carvedOf(shot).mask?.localPath).toBe(carvedOf(flat).mask?.localPath);
  });

  it("takes mediaType from the probe and covers the tile", async () => {
    const still = asDocument(await CarvedTypeV1.render({ media: FRAME }, mediaCtx()));
    const clip = asDocument(await CarvedTypeV1.render({ media: CLIP }, mediaCtx()));
    expect(carvedOf(still).mediaType).toBe("image");
    expect(carvedOf(clip).mediaType).toBe("video");
    // Contain would letterbox — and bars inside a glyph are holes in the word.
    expect(carvedOf(clip).placement?.fit).toBe("cover");
    expect(Object.keys(clip.assets ?? {})).toHaveLength(1);
  });

  it("refuses media the host never probed, and audio files", async () => {
    await expect(
      CarvedTypeV1.render({ media: "/nope/missing.mp4" }, mediaCtx()),
    ).rejects.toThrow(/no ctx.media probe/);
    await expect(
      CarvedTypeV1.render(
        { media: "a.m4a" },
        targetCtx(1280, 720, { media: { "a.m4a": { kind: "audio", durationMs: 1000 } } as never }),
      ),
    ).rejects.toThrow(/pick an image or a video/);
  });

  it("reports bad word and color together", async () => {
    await expect(
      CarvedTypeV1.render({ word: "", fallbackColor: "orange" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/word must be 1-10 ASCII.*fallbackColor/s);
  });

  it("re-fits the mask when the canvas changes", async () => {
    const wide = asDocument(await CarvedTypeV1.render({}, targetCtx(1280, 720)));
    const tall = asDocument(await CarvedTypeV1.render({}, targetCtx(720, 1280)));
    expect(carvedOf(wide).mask?.bounds.width).toBe(1280);
    expect(carvedOf(tall).mask?.bounds.width).toBe(720);
    expect(carvedOf(tall).mask?.localPath).not.toBe(carvedOf(wide).mask?.localPath);
  });
});
