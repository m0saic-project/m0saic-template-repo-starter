import type { MosaicTextSource } from "@m0saic/types";
import { evaluateM0 } from "@m0saic/dsl-stdlib";
import { latticeCellInset } from "@m0saic/template-utils";

import { outsideInSizes } from "../../../_shared/geometry";
import { asDocument, targetCtx } from "../../../__testutils__/render";
import { LatticeGuttersV1 } from "./lattice-gutters";

function buildCells(width: number, height: number, rows: number, cols: number) {
  const xs = outsideInSizes(width, cols);
  const ys = outsideInSizes(height, rows);
  const xOff = [0];
  const yOff = [0];
  for (const w of xs) xOff.push(xOff[xOff.length - 1] + w);
  for (const h of ys) yOff.push(yOff[yOff.length - 1] + h);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        unit: { c0: c, r0: r, cs: 1, rs: 1 },
        raw: { x: xOff[c], y: yOff[r], w: xs[c], h: ys[r] },
      });
    }
  }
  return cells;
}

function captionText(doc: { sources?: unknown[] }): string {
  const text = (doc.sources ?? []).find(
    (s) => (s as { type?: string }).type === "text",
  ) as MosaicTextSource;
  return ((text.layers[0]?.content as { text?: string }).text ?? "").replace(/\n/g, " ");
}

describe("@m0saic-starter/geometry/lattice-gutters/v1", () => {
  it("inset mode: plain grid base, gutters as fiber, caption prints the receipts", async () => {
    const doc = asDocument(await LatticeGuttersV1.render({}, targetCtx(1280, 720)));
    expect(doc.m0).toBe("2[3(1,1,1),3(1,1,1)]{6[-,-,-,-,-,1]}");
    // 6 tiles + the caption.
    expect(doc.sources).toHaveLength(7);
    for (const source of (doc.sources ?? []).slice(0, 6)) {
      const placement = (source as { placement?: { inset?: unknown } }).placement;
      expect(placement?.inset).toBeDefined();
    }
    expect(captionText(doc)).toMatch(/gutterMode "inset": \d+ chars, precision \d+x\d+/);
  });

  it("split mode: same lattice as real cells; even GCD-collapsed it out-costs inset", async () => {
    const inset = asDocument(await LatticeGuttersV1.render({}, targetCtx(1280, 720)));
    const split = asDocument(
      await LatticeGuttersV1.render({ gutterMode: "split" }, targetCtx(1280, 720)),
    );

    // Same tile count either way; split tiles carry NO insets.
    expect(split.sources).toHaveLength(7);
    for (const source of (split.sources ?? []).slice(0, 6)) {
      expect((source as { placement?: unknown }).placement).toBeUndefined();
    }
    const ev = evaluateM0(split.m0, { width: 1280, height: 720 });
    expect(ev.frameCount).toBe(7); // 6 cells + caption

    // 1280x720 with m=24/g=16 is FRIENDLY: the weights share a GCD of 8 and
    // the optimized builder collapses them (the gcd-collapse lesson, live).
    // Even so, the split spelling is longer and more precise than inset.
    expect(split.m0.length).toBeGreaterThan(inset.m0.length * 2);
    const insetPrec = evaluateM0(inset.m0, { width: 1280, height: 720 }).precision;
    const splitPrec = evaluateM0(split.m0, { width: 1280, height: 720 }).precision;
    expect(insetPrec.maxSplitX).toBeLessThanOrEqual(120);
    expect(splitPrec.maxSplitX).toBeGreaterThan(insetPrec.maxSplitX);
    expect(captionText(split)).toContain('gutterMode "split"');
  });

  it("at a HOSTILE canvas the split spelling balloons to raw pixel weights", async () => {
    const [width, height] = [1031, 599];
    const inset = asDocument(
      await LatticeGuttersV1.render({}, targetCtx(width, height)),
    );
    const split = asDocument(
      await LatticeGuttersV1.render({ gutterMode: "split" }, targetCtx(width, height)),
    );

    // gcd(weights) = 1 here, so no collapse: near-canvas precision.
    const splitPrec = evaluateM0(split.m0, { width, height }).precision;
    expect(splitPrec.maxSplitX).toBeGreaterThan(900);
    expect(evaluateM0(inset.m0, { width, height }).precision.maxSplitX)
      .toBeLessThanOrEqual(120);
    expect(split.m0.length).toBeGreaterThan(inset.m0.length * 3);

    // And the string carries THIS canvas's numbers: with gcd 1 the axis
    // totals appear as the split counts themselves — one slot per pixel
    // (weights canonicalize to runs of 0-tokens, not digit weights).
    expect(split.m0.startsWith("599[")).toBe(true);
    expect(split.m0).toContain("1031(");
  });

  it("the target lattice itself stays exact (library guarantee)", () => {
    const cells = buildCells(1031, 599, 2, 3);
    const lattice = latticeCellInset({
      cols: 3,
      rows: 2,
      canvasW: 1031,
      canvasH: 599,
      gutterXPx: 11,
      gutterYPx: 11,
      marginPx: 7,
      cells,
    });
    for (let c = 0; c < 2; c++) {
      const a = lattice.targets[c];
      const b = lattice.targets[c + 1];
      expect(b.x - (a.x + a.w)).toBe(11);
    }
  });

  it("tiny gutters on a fine grid stay EXACT — jitter lands in cell widths", async () => {
    // 6 cols x gutter 6 at 1280 used to clamp (slack ~1px vs +-1px jitter).
    // Line-fitting in latticeCellInset resolved it: gutters exact, cells
    // absorb the rounding, nothing to report.
    const doc = asDocument(
      await LatticeGuttersV1.render(
        { rows: 4, cols: 6, gutterPx: 6, marginPx: 18 },
        targetCtx(1280, 720),
      ),
    );
    const lattice = latticeCellInset({
      cols: 6,
      rows: 4,
      canvasW: 1280,
      canvasH: 720,
      gutterXPx: 6,
      gutterYPx: 6,
      marginPx: 18,
      cells: buildCells(1280, 720, 4, 6),
    });
    expect(lattice.maxClampPx).toBe(0);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const a = lattice.targets[r * 6 + c];
        const b = lattice.targets[r * 6 + c + 1];
        expect(b.x - (a.x + a.w)).toBe(6);
      }
    }
    expect(captionText(doc)).not.toMatch(/clamped/);
  });

  it("fails fast on out-of-range knobs", async () => {
    await expect(
      LatticeGuttersV1.render({ rows: 9 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/rows must be an integer 2-4/);
    await expect(
      LatticeGuttersV1.render({ gutterMode: "diagonal" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/gutterMode/);
  });
});
