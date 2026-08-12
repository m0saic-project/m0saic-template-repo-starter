import { asDocument, targetCtx } from "../../../__testutils__/render";
import { FolderContactStripV1 } from "./folder-contact-strip";

const paths = ["assets/media/tile-red.png", "assets/media/tile-blue.png", "assets/media/tile-gold.png"];
const mediaFor = (ps: string[]) =>
  Object.fromEntries(ps.map((p) => [p, { kind: "image", width: 64, height: 64 }]));

describe("@m0saic-starter/media/folder-contact-strip/v1", () => {
  it("empty folder renders the prompt", async () => {
    const doc = asDocument(await FolderContactStripV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("Pick a folder");
  });

  it("one asset entry + one source per path; the strip resplits to the count", async () => {
    const doc = asDocument(
      await FolderContactStripV1.render(
        { images: paths },
        targetCtx(1280, 720, { media: mediaFor(paths) as never }),
      ),
    );
    expect(Object.keys(doc.assets ?? {})).toHaveLength(3);
    expect(doc.m0).toContain("3(1,1,1)");
    expect(doc.sources).toHaveLength(4); // 3 tiles + caption
  });

  it("a single image is a full band, not an illegal 1-split", async () => {
    const one = [paths[0]];
    const doc = asDocument(
      await FolderContactStripV1.render(
        { images: one },
        targetCtx(1280, 720, { media: mediaFor(one) as never }),
      ),
    );
    expect(doc.m0).not.toContain("1(1)");
    expect(doc.sources).toHaveLength(2); // tile + caption
  });

  it("caps at 8 and says so", async () => {
    const many = new Array(10).fill(null).map((_, i) => `img-${i}.png`);
    const doc = asDocument(
      await FolderContactStripV1.render(
        { images: many },
        targetCtx(1280, 720, { media: mediaFor(many) as never }),
      ),
    );
    expect(doc.m0).toContain("8(1,1,1,1,1,1,1,1)");
    expect(JSON.stringify(doc.sources)).toContain("first 8");
  });

  it("fails fast naming the unprobed file", async () => {
    await expect(
      FolderContactStripV1.render(
        { images: ["ghost.png"] },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/"ghost.png" has no image probe/);
  });
});
