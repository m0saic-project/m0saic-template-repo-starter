import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PlaySpeedV1 } from "./play-speed";

const VID = "assets/media/bbb-2s.mp4";
const vidCtx = (durationMs = 4000) =>
  targetCtx(1280, 720, {
    durationMs,
    media: { [VID]: { kind: "video", width: 480, height: 270, durationMs: 2000 } } as never,
  });

const playback = (doc: { sources?: unknown[] }) =>
  (doc.sources?.[0] as { playback: Record<string, unknown> }).playback;

describe("@m0saic-starter/media/play-speed/v1", () => {
  it("samples a SMALL source window so loopMode has room to show itself", async () => {
    const doc = asDocument(await PlaySpeedV1.render({ video: VID }, vidCtx()));
    // Defaults: 1s of source at 1x = 1s of output inside a 4s render.
    expect(playback(doc)).toMatchObject({
      clipStartMs: 0,
      clipDurationMs: 1000,
      playSpeed: 1,
      loopMode: "loop",
    });
    expect(JSON.stringify(doc.sources?.[1])).toContain("repeats ~4.0x");
  });

  it("speed re-times the window: source ms / speed = output ms", async () => {
    const fast = asDocument(
      await PlaySpeedV1.render({ video: VID, speed: 4 }, vidCtx()),
    );
    expect(JSON.stringify(fast.sources?.[1])).toContain("1000ms of source / playSpeed 4 = 250ms");
    const slow = asDocument(
      await PlaySpeedV1.render({ video: VID, speed: 0.5 }, vidCtx()),
    );
    expect(JSON.stringify(slow.sources?.[1])).toContain("= 2000ms of output");
  });

  it("loopMode reaches playback and the caption explains the remainder", async () => {
    for (const mode of ["loop", "cut", "freeze"] as const) {
      const doc = asDocument(
        await PlaySpeedV1.render({ video: VID, loopMode: mode }, vidCtx()),
      );
      expect(playback(doc).loopMode).toBe(mode);
    }
    const freeze = asDocument(
      await PlaySpeedV1.render({ video: VID, loopMode: "freeze" }, vidCtx()),
    );
    // 4000ms render − 1000ms played = 3000ms of frozen tail. (The label
    // wraps for layout, so compare with whitespace collapsed.)
    const caption = JSON.stringify(freeze.sources?.[1]).replace(/\\n/g, " ");
    expect(caption).toContain("FREEZES its last frame for the remaining 3000ms");
  });

  it("the window never outruns the source it samples", async () => {
    const doc = asDocument(
      await PlaySpeedV1.render({ video: VID, sampleMs: 5000 }, vidCtx()),
    );
    // Probed source is 2000ms — the 5000ms request clamps to it.
    expect(playback(doc).clipDurationMs).toBe(2000);
  });

  it("gates the step grid, the sample range, and the mode", async () => {
    await expect(
      PlaySpeedV1.render({ video: VID, speed: 0.3 }, vidCtx()),
    ).rejects.toThrow(/steps of 0.25/);
    await expect(
      PlaySpeedV1.render({ video: VID, sampleMs: 100 }, vidCtx()),
    ).rejects.toThrow(/integer 250-5000/);
    await expect(
      PlaySpeedV1.render({ video: VID, loopMode: "hold" as never }, vidCtx()),
    ).rejects.toThrow(/loop \| cut \| freeze/);
  });

  it("empty video renders the prompt", async () => {
    const doc = asDocument(await PlaySpeedV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("1s sample");
  });
});
