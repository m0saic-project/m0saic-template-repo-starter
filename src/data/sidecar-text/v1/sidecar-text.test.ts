import { asDocument, targetCtx } from "../../../__testutils__/render";
import { SidecarTextV1, serializeCues } from "./sidecar-text";

const render = (props: Parameters<typeof SidecarTextV1.render>[0]) =>
  SidecarTextV1.render(props, targetCtx(1280, 720)).then(asDocument);

const captionsOf = (doc: Awaited<ReturnType<typeof render>>) =>
  (doc.sidecars as { captions: { kind: string; ext: string; content: string } }).captions;

const CUES = [{ startMs: 0, endMs: 1200, text: "first" }];

describe("@m0saic-starter/data/sidecar-text/v1", () => {
  it("emits a text sidecar, not a JSON one", async () => {
    const captions = captionsOf(await render({}));
    expect(captions.kind).toBe("text");
    expect(captions.ext).toBe("vtt");
    expect(typeof captions.content).toBe("string");
  });

  it("writes valid WebVTT", () => {
    const vtt = serializeCues(CUES, "vtt");
    expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
    expect(vtt).toContain("00:00:00.000 --> 00:00:01.200");
    expect(vtt.endsWith("\n")).toBe(true);
  });

  it("writes valid SubRip — numbered cues, comma stamps", () => {
    const srt = serializeCues(CUES, "srt");
    expect(srt.startsWith("1\n")).toBe(true);
    expect(srt).toContain("00:00:00,000 --> 00:00:01,200");
    expect(srt).not.toContain("WEBVTT");
  });

  it("keeps ext and serialiser in step", async () => {
    const captions = captionsOf(await render({ format: "srt" }));
    expect(captions.ext).toBe("srt");
    expect(captions.content).not.toContain("WEBVTT");
  });

  it("never emits CRLF — line-based formats travel badly with it", () => {
    expect(serializeCues(CUES, "srt")).not.toContain("\r");
  });

  it("names the row that failed rather than dropping it", async () => {
    await expect(render({ cues: ["0|1000|ok", "nope"] })).rejects.toThrow(/cues\[1\]/);
    await expect(render({ cues: ["1000|500|backwards"] })).rejects.toThrow(/endMs > startMs/);
  });

  it("rejects an empty cue list and an unknown format", async () => {
    await expect(render({ cues: [] })).rejects.toThrow(/non-empty/);
    await expect(
      render({ format: "ass" as unknown as "vtt" }),
    ).rejects.toThrow(/format must be one of/);
  });

  it("keeps text carrying a pipe intact", async () => {
    const captions = captionsOf(await render({ cues: ["0|900|a | b"] }));
    expect(captions.content).toContain("a | b");
  });

  it("declares the sidecar", () => {
    expect(SidecarTextV1.sidecarsSchema?.captions?.description).toMatch(/captions\.vtt/);
  });
});
