import type { MosaicTextSource } from "@m0saic/types";
import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { TextThreeWaysV1 } from "./text-three-ways";

type Sourceish = {
  type?: string;
  rasterizer?: string;
  mask?: { kind?: string; localPath?: string; bounds?: { width: number; height: number } };
};

describe("@m0saic-starter/text/text-three-ways/v1", () => {
  it("renders the word through all three pipelines, one per column", async () => {
    const doc = asDocument(await TextThreeWaysV1.render({}, targetCtx(1280, 720)));

    expect(doc.m0).toBe("3(1{1},1{1},1{1}){6[-,-,-,-,-,3(1,1,1)]}");
    const ev = evaluateM0(doc.m0, { width: 1280, height: 720 });
    expect(ev.frameCount).toBe(9); // 3 panels + 3 contents + 3 captions
    expect(doc.sources).toHaveLength(9);

    const [, drawtext, , svg, , mask] = (doc.sources ?? []) as Sourceish[];
    // 1) drawtext: a text source WITHOUT the svg rasterizer flag.
    expect(drawtext.type).toBe("text");
    expect(drawtext.rasterizer).toBeUndefined();
    // …carrying the expr beat: a per-frame % count-up ffmpeg evaluates.
    // renderMode "video" is load-bearing — an "image" still would freeze
    // the counter at frame 0.
    const dt = drawtext as unknown as MosaicTextSource;
    expect(dt.renderMode).toEqual({ kind: "video" });
    expect(dt.layers).toHaveLength(2);
    const counter = dt.layers[1].content as { kind?: string; expr?: string; eval?: string };
    expect(counter.kind).toBe("expr");
    expect(counter.eval).toBe("frame");
    expect(counter.expr).toContain("%{eif"); // compiled count-up expansion
    expect(counter.expr).toContain("\\%"); // the literal % sign, escaped
    // 2) svg: a text source WITH it — and single-layer static, which is the
    // point (an expr layer would silently fall back to drawtext).
    expect(svg.type).toBe("text");
    expect(svg.rasterizer).toBe("svg");
    expect((svg as unknown as MosaicTextSource).layers).toHaveLength(1);
    // 3) mask-carved: not a text source at all — a color tile wearing the
    // word as an inline-mask whose bounds match the column cell.
    expect(mask.type).toBe("lavfi");
    expect(mask.mask?.kind).toBe("inline-mask");
    expect(mask.mask?.localPath?.length ?? 0).toBeGreaterThan(50);
    expect(mask.mask?.bounds).toEqual({ x: 0, y: 0, width: Math.round(1280 / 3), height: 720 });
  });

  it("the first two columns share the measured font size", async () => {
    const doc = asDocument(await TextThreeWaysV1.render({}, targetCtx(1280, 720)));
    const size = (s: unknown): number | undefined =>
      ((s as MosaicTextSource).layers?.[0]?.style as { fontSize?: number })?.fontSize;
    expect(size(doc.sources?.[1])).toBeDefined();
    expect(size(doc.sources?.[1])).toBe(size(doc.sources?.[3]));
  });

  it("the word prop drives all three", async () => {
    const doc = asDocument(
      await TextThreeWaysV1.render({ word: "Hi" }, targetCtx(1280, 720)),
    );
    const literal = (s: unknown): string | undefined =>
      (((s as MosaicTextSource).layers?.[0]?.content) as { text?: string })?.text;
    expect(literal(doc.sources?.[1])).toBe("Hi");
    expect(literal(doc.sources?.[3])).toBe("Hi");
    // The mask path differs per word — compare against the default render.
    const base = asDocument(await TextThreeWaysV1.render({}, targetCtx(1280, 720)));
    expect((doc.sources?.[5] as Sourceish).mask?.localPath).not.toBe(
      (base.sources?.[5] as Sourceish).mask?.localPath,
    );
  });

  it("fails fast on bad input", async () => {
    await expect(
      TextThreeWaysV1.render({ word: "" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/1-12 ASCII/);
    await expect(
      TextThreeWaysV1.render({ word: "→→" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/1-12 ASCII/);
    await expect(
      TextThreeWaysV1.render({ inkColor: "white" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
