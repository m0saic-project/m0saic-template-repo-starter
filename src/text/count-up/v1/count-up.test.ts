import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CountUpV1 } from "./count-up";

type Counter = {
  renderMode: { kind: string };
  rasterizer?: string;
  layers: { content: { kind: string; expr?: string; eval?: string } }[];
};

const counterOf = (doc: { sources?: unknown[] }): Counter =>
  (doc.sources ?? [])[0] as Counter;

describe("@m0saic-starter/text/count-up/v1", () => {
  it("compiles the value into an eval-per-frame drawtext expression", async () => {
    const doc = asDocument(await CountUpV1.render({ value: 1200 }, targetCtx(1280, 720)));
    const layer = counterOf(doc).layers[0];
    expect(layer.content.kind).toBe("expr");
    expect(layer.content.eval).toBe("frame"); // without this ffmpeg draws a constant
    expect(layer.content.expr).toContain("%{eif"); // the integer expansion
    expect(layer.content.expr).toContain("1200"); // the ramp's target
    // NOT the svg path: baked glyphs cannot animate.
    expect(counterOf(doc).rasterizer).toBeUndefined();
  });

  it("keeps literal words literal and animates every digit run", async () => {
    const doc = asDocument(
      await CountUpV1.render({ value: 42, suffix: "of 99" }, targetCtx(1280, 720)),
    );
    const expr = counterOf(doc).layers[0].content.expr ?? "";
    // Both numbers count; the word between them survives as literal text.
    expect(expr.match(/%\{eif/g) ?? []).toHaveLength(2);
    expect(expr).toContain("of");
  });

  it("derives the ramp from ctx.target.durationMs, never a constant", async () => {
    const short = asDocument(await CountUpV1.render({}, targetCtx(1280, 720, { durationMs: 2000 })));
    const long = asDocument(await CountUpV1.render({}, targetCtx(1280, 720, { durationMs: 6000 })));
    expect(counterOf(short).layers[0].content.expr).toContain("/2");
    expect(counterOf(long).layers[0].content.expr).toContain("/6");
  });

  it("freezeAsStill keeps the expression but drops to one frame (the trap)", async () => {
    const video = asDocument(await CountUpV1.render({}, targetCtx(1280, 720)));
    const still = asDocument(await CountUpV1.render({ freezeAsStill: true }, targetCtx(1280, 720)));
    expect(counterOf(video).renderMode.kind).toBe("video");
    expect(counterOf(still).renderMode.kind).toBe("image");
    // Same compiled expr either way — that is exactly why it fails quietly.
    expect(counterOf(still).layers[0].content.expr).toBe(
      counterOf(video).layers[0].content.expr,
    );
  });

  it("refuses values the eif expansion cannot print", async () => {
    await expect(CountUpV1.render({ value: 12.5 }, targetCtx(1280, 720))).rejects.toThrow(
      /whole number/,
    );
    await expect(CountUpV1.render({ value: -1 }, targetCtx(1280, 720))).rejects.toThrow(
      /value must be 0-/,
    );
  });

  it("zero is a legal target", async () => {
    const doc = asDocument(await CountUpV1.render({ value: 0, suffix: "" }, targetCtx(1280, 720)));
    expect(counterOf(doc).layers[0].content.expr).toContain("%{eif");
    expect(doc.sources).toHaveLength(3);
  });
});
