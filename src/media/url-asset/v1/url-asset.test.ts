import { asDocument, targetCtx } from "../../../__testutils__/render";
import { UrlAssetV1 } from "./url-asset";

describe("@m0saic-starter/media/url-asset/v1", () => {
  it("empty url renders the explainer (offline-safe by default)", async () => {
    const doc = asDocument(await UrlAssetV1.render({}, targetCtx(1280, 720)));
    expect(doc.assets).toEqual({});
    expect(JSON.stringify(doc.sources)).toContain("reproducible");
  });

  it("a url becomes a {kind:\"url\"} manifest entry + media source", async () => {
    const url = "https://example.com/pic.png";
    const doc = asDocument(await UrlAssetV1.render({ url }, targetCtx(1280, 720)));
    expect(doc.assets).toMatchObject({ remote_image: { kind: "url", url } });
    expect((doc.sources?.[0] as { assetId: string }).assetId).toBe("remote_image");
    expect(JSON.stringify(doc.sources?.[1])).toContain("offline fails");
  });

  it("gates non-https values", async () => {
    await expect(
      UrlAssetV1.render({ url: "ftp://x" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/https URL/);
  });
});
