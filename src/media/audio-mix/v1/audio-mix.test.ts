import { asDocument, targetCtx } from "../../../__testutils__/render";
import { AudioMixV1 } from "./audio-mix";

const TONE = "assets/media/tone-440-320x240-2s.mp4";
const audioCtx = () =>
  targetCtx(1280, 720, {
    media: { [TONE]: { kind: "audio", durationMs: 2000 } } as never,
  });

describe("@m0saic-starter/media/audio-mix/v1", () => {
  it("audio sources carry volume and ride their own meter row", async () => {
    const doc = asDocument(
      await AudioMixV1.render(
        { narration: TONE, narrationVolume: 1 },
        audioCtx(),
      ),
    );
    // `<meter>{1}`: the track is an overlay ON the bar's row, so it shares
    // that rect instead of covering the whole canvas.
    expect(doc.m0).toContain("{1}");
    const audio = (doc.sources ?? []).filter(
      (s) => (s as { mediaType?: string }).mediaType === "audio",
    );
    expect(audio).toHaveLength(1);
    expect((audio[0] as { audio: { volume: number; enabled: boolean } }).audio).toMatchObject({
      volume: 1,
      enabled: true,
    });
  });

  it("the mute idiom keeps the source, flips enabled", async () => {
    const on = asDocument(
      await AudioMixV1.render({ music: TONE, muteMusic: false }, audioCtx()),
    );
    const off = asDocument(
      await AudioMixV1.render({ music: TONE, muteMusic: true }, audioCtx()),
    );
    const track = (d: typeof off) =>
      (d.sources ?? []).find((s) => (s as { mediaType?: string }).mediaType === "audio") as {
        audio: { enabled: boolean };
      };
    expect(track(on).audio.enabled).toBe(true);
    expect(track(off).audio.enabled).toBe(false);
    // Same number of audio sources either way — the shape is stable.
    expect(on.sources?.filter((s) => (s as { mediaType?: string }).mediaType === "audio"))
      .toHaveLength(1);
    expect(off.sources?.filter((s) => (s as { mediaType?: string }).mediaType === "audio"))
      .toHaveLength(1);
  });

  it("renders the mixer with no files at all (meters + caption only)", async () => {
    const doc = asDocument(await AudioMixV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("no file");
  });

  it("treats volume as a GAIN factor, and stops where the ENGINE stops", async () => {
    // The engine lowers volume onto ffmpeg's `volume=` filter, which
    // amplifies above unity — so doubling must render, not throw. The
    // ceiling here is 4 because that is where the engine's own validator
    // starts warning about clipping; anything under it renders clean.
    for (const gain of [2, 3, 4]) {
      const doc = asDocument(
        await AudioMixV1.render(
          { narration: TONE, narrationVolume: gain },
          audioCtx(),
        ),
      );
      const track = (doc.sources ?? []).find(
        (s) => (s as { mediaType?: string }).mediaType === "audio",
      ) as { audio: { volume: number } };
      expect(track.audio.volume).toBe(gain);
    }

    await expect(
      AudioMixV1.render({ musicVolume: -0.1 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/gain factor/);
    await expect(
      AudioMixV1.render({ musicVolume: 4.5 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/0-4 here/);
  });

  it("a gain too small to paint a bar still balances sources against frames", async () => {
    // The meter rounds to 100 units, so a tiny gain paints NO bar. The
    // sources list has to make the same call the m0 did — one source per
    // frame, or the whole document is off by one.
    const doc = asDocument(
      await AudioMixV1.render(
        { narration: TONE, narrationVolume: 0.001 },
        audioCtx(),
      ),
    );
    // The narration row collapses to a null carrying its track, so the
    // orange bar tile must NOT be in the list: track + music bar + caption.
    expect(doc.m0).toContain("-{1}");
    const colors = (doc.sources ?? [])
      .filter((s) => (s as { type?: string }).type === "lavfi")
      .map((s) => (s as { color?: string }).color);
    expect(colors).toEqual(["#2e86c1"]);
    expect(doc.sources ?? []).toHaveLength(3);
  });

  it("a zero-volume bar still gives its track a frame", async () => {
    // The bar collapses to a null, but the overlay carrying the track
    // stays — muting must never drop the source.
    const doc = asDocument(
      await AudioMixV1.render(
        { narration: TONE, narrationVolume: 0 },
        audioCtx(),
      ),
    );
    const audio = (doc.sources ?? []).filter(
      (s) => (s as { mediaType?: string }).mediaType === "audio",
    );
    expect(audio).toHaveLength(1);
  });
});
