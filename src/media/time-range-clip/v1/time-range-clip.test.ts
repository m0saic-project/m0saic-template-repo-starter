import { asDocument, targetCtx } from "../../../__testutils__/render";
import { TimeRangeClipV1 } from "./time-range-clip";

const VID = "assets/media/bbb-2s.mp4";
const vidCtx = () =>
  targetCtx(1280, 720, {
    media: { [VID]: { kind: "video", width: 480, height: 270, durationMs: 2000 } } as never,
  });

describe("@m0saic-starter/media/time-range-clip/v1", () => {
  it("the window lands as clipStartMs + clipDurationMs (start + LENGTH)", async () => {
    const doc = asDocument(
      await TimeRangeClipV1.render(
        { video: VID, clipStartMs: 500, clipEndMs: 1500 },
        vidCtx(),
      ),
    );
    const playback = (doc.sources?.[0] as { playback: Record<string, unknown> }).playback;
    expect(playback).toMatchObject({ clipStartMs: 500, clipDurationMs: 1000, loopMode: "loop" });
    expect(JSON.stringify(doc.sources?.[1])).toContain("500ms -> 1500ms");
  });

  it("gates the window shape and the source duration", async () => {
    await expect(
      TimeRangeClipV1.render({ video: VID, clipStartMs: 900, clipEndMs: 900 }, vidCtx()),
    ).rejects.toThrow(/start < end/);
    await expect(
      TimeRangeClipV1.render({ video: VID, clipStartMs: 0, clipEndMs: 5000 }, vidCtx()),
    ).rejects.toThrow(/past the source's 2000ms/);
  });

  it("empty video renders the prompt", async () => {
    const doc = asDocument(await TimeRangeClipV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("scrubber");
  });
});
