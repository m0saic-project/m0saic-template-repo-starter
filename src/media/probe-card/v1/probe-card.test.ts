import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ProbeCardV1 } from "./probe-card";

const VID = "assets/media/bbb-2s.mp4";

describe("@m0saic-starter/media/probe-card/v1", () => {
  it("prints the probe for a video, duration included", async () => {
    const doc = asDocument(
      await ProbeCardV1.render(
        { media: VID },
        targetCtx(1280, 720, {
          media: { [VID]: { kind: "video", width: 480, height: 270, durationMs: 2000 } } as never,
        }),
      ),
    );
    const sheet = JSON.stringify(doc.sources?.[0]);
    expect(sheet).toContain("480x270");
    expect(sheet).toContain("2.00s");
    expect((doc.sources?.[1] as { mediaType: string }).mediaType).toBe("video");
  });

  it("a still gets the no-timeline line", async () => {
    const img = "x.png";
    const doc = asDocument(
      await ProbeCardV1.render(
        { media: img },
        targetCtx(1280, 720, { media: { [img]: { kind: "image", width: 10, height: 10 } } as never }),
      ),
    );
    expect(JSON.stringify(doc.sources?.[0])).toContain("no timeline");
  });

  it("empty prompt + unprobed fail-fast", async () => {
    const doc = asDocument(await ProbeCardV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("prints its probe");
    await expect(
      ProbeCardV1.render({ media: "ghost.mp4" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/no entry for "ghost.mp4"/);
  });
});
