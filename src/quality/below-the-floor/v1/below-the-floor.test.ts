import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { BelowTheFloorV1 } from "./below-the-floor";

const render = (
  props: Parameters<typeof BelowTheFloorV1.render>[0],
  w = 1280,
  h = 720,
) => BelowTheFloorV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

/** Canvases the three states must hold at — landscape, small, portrait, 4K. */
const CANVASES: Array<[number, number]> = [
  [1280, 720],
  [640, 360],
  [1080, 1920],
  [3840, 2160],
];

describe("@m0saic-starter/quality/below-the-floor/v1", () => {
  it("fits: clears BOTH floors, and says so", async () => {
    const doc = await render({ mode: "fits" });
    expect(text(doc)).toContain("FITS");
    const e = evaluateM0(String(doc.m0), { width: 1280, height: 720 });
    expect(e.feasible).toBe(true);
    expect(e.meetsPrecision).toBe(true);
  });

  /** The silent one. It RENDERS — that is the whole problem. */
  it("under-precision: feasible, misses precision, and still returns a document", async () => {
    const doc = await render({ mode: "under-precision" });
    expect(doc.kind).toBe("mosaic_document");
    expect(text(doc)).toContain("UNDER PRECISION");

    const e = evaluateM0(String(doc.m0), { width: 1280, height: 720 });
    expect(e.feasible).toBe(true);
    expect(e.meetsPrecision).toBe(false);
  });

  it("unrenderable: reports instead of handing the engine a doomed m0", async () => {
    const doc = await render({ mode: "unrenderable" });
    const t = text(doc);
    expect(t).toContain("Unrenderable at this canvas");
    expect(t).toContain("SPLIT_EXCEEDS_AXIS");
    // It names the number to fix, not just that something is wrong.
    expect(t).toMatch(/raise the canvas to \d+x\d+/);
  });

  it("each mode lands in its state at every canvas", async () => {
    for (const [w, h] of CANVASES) {
      const fits = await render({ mode: "fits" }, w, h);
      const under = await render({ mode: "under-precision" }, w, h);

      const ef = evaluateM0(String(fits.m0), { width: w, height: h });
      expect([w, h, ef.feasible, ef.meetsPrecision]).toEqual([w, h, true, true]);

      const eu = evaluateM0(String(under.m0), { width: w, height: h });
      expect([w, h, eu.feasible, eu.meetsPrecision]).toEqual([w, h, true, false]);

      // Unrenderable is refused, so its doc is the report card.
      const un = await render({ mode: "unrenderable" }, w, h);
      expect(text(un)).toContain("Unrenderable at this canvas");
    }
  });

  /**
   * The claim that makes it ONE design rather than three: proportions are
   * identical across modes, only the granularity moves. If the default GCD
   * reduction ever came back, `[S,S,8S]` would collapse to `[1,1,8]` and the
   * floors would stop moving — so this also guards `mode: "literal"`.
   */
  it("every mode is the same 10/10/80 design at a different scale", async () => {
    const fits = await render({ mode: "fits" });
    const under = await render({ mode: "under-precision" });

    for (const doc of [fits, under]) {
      const m0 = String(doc.m0);
      const slots = Number(/^(\d+)\(/.exec(m0)?.[1]);
      // Three claimants, and the slot count is 10 x the scale.
      expect(slots % 10).toBe(0);
      expect((m0.match(/1\{1\}/g) ?? []).length).toBe(1);
      expect(doc.sources).toHaveLength(4);
    }

    // Same shape, strictly finer.
    const slotsOf = (d: { m0: unknown }) => Number(/^(\d+)\(/.exec(String(d.m0))?.[1]);
    expect(slotsOf(under)).toBeGreaterThan(slotsOf(fits));
  });

  it("the caption prints all three numbers", async () => {
    const t = text(await render({ mode: "fits" })).replace(/\\n/g, " ");
    expect(t).toContain("canvas 1280x720");
    expect(t).toContain("feasibility");
    expect(t).toContain("precision");
    expect(t).toContain("folded floor");
  });

  /**
   * The framework auto-compacts every render, losslessly reducing splits to
   * their minimum form — `[8,8,64]` would become `[1,1,8]`, an m0 that draws
   * the same picture with a tenth of the slots. Here the slot count IS the
   * subject, so the template opts out with `skipAutoCompact`. Without it the
   * shipped m0 silently disagrees with the caption describing it.
   */
  it("ships the authored granularity — compaction does not eat the lesson", async () => {
    for (const [mode, w] of [
      ["fits", 1280],
      ["under-precision", 1280],
      ["fits", 640],
    ] as const) {
      const doc = await render({ mode }, w, Math.round((w * 9) / 16));
      const slots = Number(/^(\d+)\(/.exec(String(doc.m0))?.[1]);
      // 10 slots per unit of scale, and never the compacted 10-slot form
      // unless the scale really is 1.
      expect(slots % 10).toBe(0);
      expect(slots).toBeGreaterThan(10);
    }
  });

  it("the readout reports MEASURED numbers, matching the shipped m0", async () => {
    const doc = await render({ mode: "under-precision" });
    const e = evaluateM0(String(doc.m0), { width: 1280, height: 720 });
    const t = text(doc).replace(/\\n/g, " ");
    // Every number in the caption is read back off the document, not
    // recomputed from the inputs that produced it.
    expect(t).toContain(`feasibility ${e.feasibility.minWidthPx}px`);
    expect(t).toContain(`precision ${e.precision.maxSplitX}px`);
    expect(t).toContain(`folded floor ${e.recommendedMin.width}px`);
    expect(t).toContain(`slots ${e.precision.maxSplitX}`);
    expect(t).toContain(`spread ${e.maxSpreadPx}px`);
  });

  it("spread is 0 when it fits and nonzero once under the floor", async () => {
    const fits = await render({ mode: "fits" });
    const under = await render({ mode: "under-precision" });
    expect(evaluateM0(String(fits.m0), { width: 1280, height: 720 }).maxSpreadPx).toBe(0);
    expect(
      evaluateM0(String(under.m0), { width: 1280, height: 720 }).maxSpreadPx,
    ).toBeGreaterThan(0);
  });

  it("rejects bad props", async () => {
    await expect(render({ mode: "tiny" as never })).rejects.toThrow(/must be one of/);
    await expect(render({ bandColor: "red" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    const a = await render({ mode: "under-precision" });
    const b = await render({ mode: "under-precision" });
    expect(a).toEqual(b);
  });
});
