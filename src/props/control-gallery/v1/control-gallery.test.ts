import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ControlGalleryV1 } from "./control-gallery";

describe("@m0saic-starter/props/control-gallery/v1", () => {
  it("renders the spec sheet + a strength meter", async () => {
    const doc = asDocument(await ControlGalleryV1.render({}, targetCtx(1280, 720)));
    expect(doc.sources).toHaveLength(2); // sheet + meter tile
    const sheet = JSON.stringify(doc.sources?.[0]);
    expect(sheet).toContain("placeholder");
    expect(sheet).toContain("oneOf");
  });

  it("strength 0 nulls the meter and drops its tile", async () => {
    const doc = asDocument(
      await ControlGalleryV1.render({ strength: 0 }, targetCtx(1280, 720)),
    );
    expect(doc.sources).toHaveLength(1);
  });

  it("flavor is a hint — render() still gates the URL", async () => {
    await expect(
      ControlGalleryV1.render({ homepage: "not a url" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/http\(s\) URL/);
    const ok = await ControlGalleryV1.render(
      { homepage: "https://github.com" },
      targetCtx(1280, 720),
    );
    expect(ok).toBeTruthy();
  });

  it("gates the enum and the bounds", async () => {
    await expect(
      ControlGalleryV1.render({ season: "monsoon" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/spring \| summer/);
    await expect(
      ControlGalleryV1.render({ strength: 101 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/0-100/);
  });
});
