import { asDocument, targetCtx } from "../../../__testutils__/render";
import { NestedPipelineV1 } from "./nested-pipeline";

const render = (props: Parameters<typeof NestedPipelineV1.render>[0], durationMs = 2000) =>
  NestedPipelineV1.render(props, targetCtx(1280, 720, { durationMs })).then(asDocument);

const reelOf = (doc: { children?: Record<string, unknown> }) =>
  (doc.children ?? {})["reel"] as {
    kind: string;
    emit?: string;
    size: { width: number; height: number };
    fps: number;
    durationMs: number;
    steps: { durationMs: number }[];
  };

describe("@m0saic-starter/pipelines/nested-pipeline/v1", () => {
  it("puts a whole PIPELINE behind one tile", async () => {
    const doc = await render({});
    const reel = reelOf(doc);
    expect(reel.kind).toBe("mosaic_pipeline");
    expect(reel.steps).toHaveLength(2);
    expect(doc.sources?.[0]).toMatchObject({ type: "mosaic", ref: "reel" });
  });

  it("declares its own geometry triple — the stamp hazard", async () => {
    const reel = reelOf(await render({ innerMs: 1200 }));
    // Left undefined these would inherit whatever slot it lands in: fine
    // standalone, surprising the first time it is embedded.
    expect(reel.size).toEqual({ width: 640, height: 720 });
    expect(reel.fps).toBe(30);
    expect(reel.durationMs).toBe(1200);
  });

  it("hands the shortfall to the embedding source's loopMode", async () => {
    for (const loopMode of ["loop", "freeze", "cut"] as const) {
      const doc = await render({ loopMode });
      expect(doc.sources?.[0]).toMatchObject({ playback: { loopMode } });
    }
  });

  it("says when the inner reel already fills the slot", async () => {
    const short = await render({ innerMs: 1200 }, 2000);
    expect(JSON.stringify(short.sources)).toContain("fills the 800ms remainder");
    const exact = await render({ innerMs: 2000 }, 2000);
    expect(JSON.stringify(exact.sources)).toContain("no remainder");
  });

  it("never asks for a nested fan-out", async () => {
    // emit "multi" would silently downgrade here, so the template doesn't
    // pretend: it declares single.
    expect(reelOf(await render({})).emit).toBe("single");
  });
});
