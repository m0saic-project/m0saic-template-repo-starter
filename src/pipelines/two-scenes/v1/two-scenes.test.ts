import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { TwoScenesV1 } from "./two-scenes";

const render = (
  props: Parameters<typeof TwoScenesV1.render>[0],
  durationMs = 2000,
) => TwoScenesV1.render(props, targetCtx(1280, 720, { durationMs })).then(asPipeline);

const stitched = (p: Awaited<ReturnType<typeof render>>): number => {
  const sum = p.steps.reduce((n, s) => n + s.durationMs, 0);
  const overlap = p.steps.reduce((n, s) => {
    const t = s.transitionToNext as { durationMs?: number } | undefined;
    return n + (t?.durationMs ?? 0);
  }, 0);
  return sum - overlap;
};

describe("@m0saic-starter/pipelines/two-scenes/v1", () => {
  it("returns a pipeline of two whole documents", async () => {
    const p = await render({});
    expect(p.steps).toHaveLength(2);
    for (const step of p.steps) {
      const doc = (step as { file: { kind: string; m0: string; durationMs: number } }).file;
      expect(doc.kind).toBe("mosaic_document");
      // A step is a document: own m0, own canvas, own exact duration.
      expect(doc.m0.length).toBeGreaterThan(0);
      expect(doc.durationMs).toBe(step.durationMs);
    }
    expect(p.emit).toBe("single");
  });

  it("STITCHES to ctx.target.durationMs, overlap included", async () => {
    // The invariant the engine enforces: Σ step durations − Σ overlap must
    // land exactly on the target, so the scenes are derived from it.
    for (const durationMs of [1000, 2000, 3333]) {
      for (const transitionMs of [0, 250, 700]) {
        const p = await render({ transition: "fade", transitionMs }, durationMs);
        expect(stitched(p)).toBe(durationMs);
      }
    }
  });

  it("each scene carries half the overlap on top of its visible time", async () => {
    const p = await render({ transition: "fade", transitionMs: 300 }, 2000);
    // (2000 + 300) / 2, split so the two are exact.
    expect(p.steps.map((s) => s.durationMs)).toEqual([1150, 1150]);
    expect(JSON.stringify(p.steps[1])).toContain("1150+1150-300 = 2000ms");
  });

  it("a cut needs no overlap at all", async () => {
    const p = await render({ transition: "cut" }, 2000);
    expect(p.steps[0].transitionToNext).toEqual({ type: "cut" });
    expect(p.steps.map((s) => s.durationMs)).toEqual([1000, 1000]);
  });

  it("the last step never carries a transition", async () => {
    const p = await render({});
    expect(p.steps[p.steps.length - 1].transitionToNext).toBeUndefined();
  });

  it("refuses an overlap longer than the clip itself", async () => {
    await expect(
      TwoScenesV1.render({ transitionMs: 2000 }, targetCtx(1280, 720, { durationMs: 1000 })),
    ).rejects.toThrow(/must be shorter than the clip/);
  });
});
