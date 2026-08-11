import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ErrorMosaicV1 } from "./error-mosaic";

describe("@m0saic-starter/props/error-mosaic/v1", () => {
  it("happy path renders the ratio card", async () => {
    const doc = asDocument(await ErrorMosaicV1.render({}, targetCtx(1280, 720)));
    expect(doc.sources).toHaveLength(3);
  });

  it("problems RENDER instead of throwing — the report card is the document", async () => {
    const doc = asDocument(
      await ErrorMosaicV1.render({ ratio: 5 }, targetCtx(1280, 720)),
    );
    expect(doc.kind).toBe("mosaic_document");
    const text = JSON.stringify(doc.sources);
    expect(text).toContain("0.1 and 0.9");
  });

  it("multiple problems stack on one card", async () => {
    const doc = asDocument(
      await ErrorMosaicV1.render(
        { ratio: 5, accent: "orange", tags: "a,b,c,d,e" },
        targetCtx(1280, 720),
      ),
    );
    const text = JSON.stringify(doc.sources);
    expect(text).toContain("0.1 and 0.9");
    expect(text).toContain("rrggbb");
    expect(text).toContain("1 to 4");
  });

  it("is deterministic on both paths", async () => {
    const a = await ErrorMosaicV1.render({ ratio: 5 }, targetCtx(1280, 720));
    const b = await ErrorMosaicV1.render({ ratio: 5 }, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });
});
