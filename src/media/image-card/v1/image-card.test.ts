import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ImageCardV1 } from "./image-card";

const IMG = "assets/media/epoch-m-1024x1024.png";
const ctxWithImage = () =>
  targetCtx(1280, 720, {
    media: { [IMG]: { kind: "image", width: 1024, height: 1024 } } as never,
  });

describe("@m0saic-starter/media/image-card/v1", () => {
  it("empty image renders the prompt card, never a dead preview", async () => {
    const doc = asDocument(await ImageCardV1.render({}, targetCtx(1280, 720)));
    expect(doc.sources).toHaveLength(1);
    expect(JSON.stringify(doc.sources)).toContain("Pick an image");
  });

  it("mints the asset + media source from the probed path", async () => {
    const doc = asDocument(await ImageCardV1.render({ image: IMG }, ctxWithImage()));
    const keys = Object.keys(doc.assets ?? {});
    expect(keys).toHaveLength(1);
    expect((doc.assets as Record<string, { kind: string; path: string }>)[keys[0]]).toMatchObject({
      kind: "file",
      path: IMG,
    });
    const media = doc.sources?.[0] as { type: string; assetId: string; placement: { fit: string } };
    expect(media.type).toBe("media");
    expect(media.assetId).toBe(keys[0]);
    expect(media.placement.fit).toBe("contain");
    expect(JSON.stringify(doc.sources?.[1])).toContain("1024x1024");
  });

  it("cover flows through to placement", async () => {
    const doc = asDocument(
      await ImageCardV1.render({ image: IMG, fit: "cover" }, ctxWithImage()),
    );
    expect((doc.sources?.[0] as { placement: { fit: string } }).placement.fit).toBe("cover");
  });

  it("fails fast on an unprobed path and a non-image", async () => {
    await expect(
      ImageCardV1.render({ image: "nope.png" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/no probed dimensions/);
    await expect(
      ImageCardV1.render(
        { image: IMG },
        targetCtx(1280, 720, {
          media: { [IMG]: { kind: "video", width: 100, height: 100 } } as never,
        }),
      ),
    ).rejects.toThrow(/pick an image/);
  });
});
