import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PathMaskV1 } from "./path-mask";

type Masked = {
  mask: { kind: string; localPath: string; matte?: number; bounds: { width: number } };
};

const maskOf = (doc: { sources?: unknown[] }): Masked["mask"] =>
  ((doc.sources ?? [])[0] as Masked).mask;

/** The sweep flag of every arc in the path, in order. */
const sweeps = (d: string): string[] =>
  [...d.matchAll(/A \d+ \d+ 0 1 ([01]) /g)].map((m) => m[1]);

const render = (props: Parameters<typeof PathMaskV1.render>[0]) =>
  PathMaskV1.render(props, targetCtx(1280, 720)).then(asDocument);

describe("@m0saic-starter/masks/path-mask/v1", () => {
  it("both modes emit the same two subpaths — only the winding differs", async () => {
    const ring = maskOf(await render({ innerWinding: "opposite" }));
    const disc = maskOf(await render({ innerWinding: "same" }));

    for (const d of [ring.localPath, disc.localPath]) {
      expect((d.match(/M /g) ?? []).length).toBe(2); // outer + inner
      expect(sweeps(d)).toHaveLength(4); // two half-arcs each
    }
    // Outer is clockwise in both. The inner pair is the entire lesson.
    expect(sweeps(ring.localPath)).toEqual(["1", "1", "0", "0"]);
    expect(sweeps(disc.localPath)).toEqual(["1", "1", "1", "1"]);
  });

  it("carries matte only when it is doing something", async () => {
    const clipped = maskOf(await render({ matte: 0 }));
    const washed = maskOf(await render({ matte: 0.3 }));
    // 0 IS the default — the document shouldn't carry a knob it isn't using.
    expect("matte" in clipped).toBe(false);
    expect(washed.matte).toBe(0.3);
    // The wash doesn't touch the shape.
    expect(washed.localPath).toBe(clipped.localPath);
  });

  it("scales the ring off ctx.target, never a hardcoded radius", async () => {
    const big = maskOf(asDocument(await PathMaskV1.render({}, targetCtx(1280, 720))));
    const small = maskOf(asDocument(await PathMaskV1.render({}, targetCtx(640, 360))));
    expect(big.bounds.width).toBe(640);
    expect(small.bounds.width).toBe(320);
    expect(small.localPath).not.toBe(big.localPath);
  });

  it("names the fill rule's cost in the caption", async () => {
    const disc = asDocument(await PathMaskV1.render({ innerWinding: "same" }, targetCtx(1280, 720)));
    // The caption is the only signal a same-wound inner path gives you —
    // the engine itself never complains.
    expect(JSON.stringify(disc.sources)).toContain("fills in");
  });

  it("reports every bad prop at once", async () => {
    await expect(
      PathMaskV1.render(
        { innerWinding: "widdershins" as never, matte: 4, inkColor: "blue" },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/innerWinding must be one of.*matte is an alpha 0-1.*inkColor/s);
  });
});
