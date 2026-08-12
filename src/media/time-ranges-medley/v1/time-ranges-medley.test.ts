import { asDocument, targetCtx } from "../../../__testutils__/render";
import { TimeRangesMedleyV1 } from "./time-ranges-medley";

const VID = "assets/media/bbb-2s.mp4";
const vidCtx = () =>
  targetCtx(1280, 720, {
    media: { [VID]: { kind: "video", width: 480, height: 270, durationMs: 2000 } } as never,
  });

describe("@m0saic-starter/media/time-ranges-medley/v1", () => {
  it("declares the time-ranges picker on the single json prop", () => {
    const control = TimeRangesMedleyV1.propsSchema?.ranges?.meta?.control;
    expect(control?.picker).toBe("time-ranges");
    expect(control?.videoFromProp).toBe("video");
  });

  it("maps every window to a column with start + LENGTH playback", async () => {
    const doc = asDocument(
      await TimeRangesMedleyV1.render(
        {
          video: VID,
          ranges: [
            { startMs: 0, endMs: 500, label: "open" },
            { startMs: 1200, endMs: 2000 },
          ],
        },
        vidCtx(),
      ),
    );
    expect(doc.m0).toContain("2(1,1)");
    const cols = (doc.sources ?? []).filter(
      (s) => (s as { mediaType?: string }).mediaType === "video",
    ) as unknown as Array<{ assetId: string; playback: Record<string, number> }>;
    expect(cols).toHaveLength(2);
    expect(cols[0].playback).toMatchObject({ clipStartMs: 0, clipDurationMs: 500 });
    expect(cols[1].playback).toMatchObject({ clipStartMs: 1200, clipDurationMs: 800 });
    // One file, many windows: both columns share the assetId.
    expect(cols[0].assetId).toBe(cols[1].assetId);
    expect(JSON.stringify(doc.sources)).toContain("open(500ms)");
  });

  it("collects EVERY range problem before throwing", async () => {
    await expect(
      TimeRangesMedleyV1.render(
        {
          video: VID,
          ranges: [
            { startMs: -5, endMs: 100 },
            { startMs: 500, endMs: 500 },
            { startMs: 0, endMs: 9000 },
          ],
        },
        vidCtx(),
      ),
    ).rejects.toThrow(/ranges\[0\]\.startMs[\s\S]*ranges\[1\][\s\S]*ranges\[2\]\.endMs 9000/);
  });

  it("a SINGLE range (the default) is a full band, not an illegal 1-split", async () => {
    const doc = asDocument(
      await TimeRangesMedleyV1.render({ video: VID }, vidCtx()),
    );
    expect(doc.m0).not.toContain("1(1)");
    const cols = (doc.sources ?? []).filter(
      (s) => (s as { mediaType?: string }).mediaType === "video",
    );
    expect(cols).toHaveLength(1);
  });

  it("empty video renders the prompt", async () => {
    const doc = asDocument(await TimeRangesMedleyV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("medley column");
  });
});
