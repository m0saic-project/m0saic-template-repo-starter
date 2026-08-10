import type { MosaicTextSource } from "@m0saic/types";
import { findFrames } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { QuantizationCuresV1 } from "./quantization-cures";

const W = 1280;
const H = 720;

async function docFor(method?: string) {
  return asDocument(
    await QuantizationCuresV1.render(
      method ? { method: method as never } : {},
      targetCtx(W, H),
    ),
  );
}

function captionOf(doc: { sources?: unknown[] }): string {
  const texts = (doc.sources ?? []).filter(
    (s) => (s as { type?: string }).type === "text",
  );
  const layer = (texts[0] as MosaicTextSource | undefined)?.layers?.[0];
  return String((layer?.content as { text?: string } | undefined)?.text ?? "").replace(
    /\n/g,
    " ",
  );
}

/** Content cells at this canvas (excludes caption overlay + null gutters). */
function cellsOf(m0: string) {
  return findFrames(
    m0,
    (f) => f.kind === "frame" && f.overlayDepth === 0,
    { width: W, height: H },
  );
}

describe("@m0saic-starter/geometry/quantization-cures/v1", () => {
  it("naive: ratio gutters wobble N/N+1 px and the caption prints the deal", async () => {
    const doc = await docFor(); // default method = naive
    const gutters = findFrames(
      doc.m0,
      (f) => f.kind === "null" && f.overlayDepth === 0 && f.width < 24,
      { width: W, height: H },
    ).map((f) => f.width);
    expect(gutters.length).toBe(33); // 11 column gutters × 3 rows
    const minG = Math.min(...gutters);
    const maxG = Math.max(...gutters);
    // 1280 / 299 ≈ 4.28 px per weight — some gutters get 4, some 5.
    expect(maxG - minG).toBeGreaterThanOrEqual(1);
    expect(captionOf(doc)).toContain(`${minG}-${maxG}px`);
  });

  it("every method renders the same 36 checkerboard cells", async () => {
    for (const method of ["naive", "inset", "snap", "rects"]) {
      const doc = await docFor(method);
      expect(cellsOf(doc.m0)).toHaveLength(36);
      const fills = (doc.sources ?? []).filter(
        (s) => (s as { type?: string }).type === "lavfi",
      );
      expect(fills).toHaveLength(36);
    }
  });

  it("snap: every cell identical, coverage below 100% at a hostile canvas", async () => {
    const doc = await docFor("snap");
    const cells = cellsOf(doc.m0);
    const widths = new Set(cells.map((c) => c.width));
    const heights = new Set(cells.map((c) => c.height));
    expect(widths.size).toBe(1);
    expect(heights.size).toBe(1);
    expect(captionOf(doc)).toContain("coverage");
  });

  it("rects: gutters exactly 4px between neighbors, baked receipts on the caption", async () => {
    const doc = await docFor("rects");
    const cells = cellsOf(doc.m0).sort((a, b) => a.y - b.y || a.x - b.x);
    const row0 = cells.slice(0, 12);
    for (let i = 1; i < row0.length; i++) {
      expect(row0[i].x - (row0[i - 1].x + row0[i - 1].width)).toBe(4);
    }
    expect(captionOf(doc)).toContain(`baked to ${W}x${H}`);
  });

  it("inset: the m0 stays a tiny plain grid and the caption promises exact gutters", async () => {
    const doc = await docFor("inset");
    // Strip the caption overlay — the base spelling is the receipt.
    // A plain 3×12 grid spells in ~86 chars regardless of canvas.
    const base = doc.m0.slice(0, doc.m0.indexOf("{"));
    expect(base.length).toBeLessThan(100);
    expect(captionOf(doc)).toContain(`EXACT 4px`);
  });

  it("the cures cost wildly different string lengths", async () => {
    const insetLen = (await docFor("inset")).m0.length;
    const rectsLen = (await docFor("rects")).m0.length;
    expect(rectsLen).toBeGreaterThan(insetLen * 3);
  });

  it("is deterministic per target and method", async () => {
    const a = await QuantizationCuresV1.render({ method: "snap" }, targetCtx(W, H));
    const b = await QuantizationCuresV1.render({ method: "snap" }, targetCtx(W, H));
    expect(a).toEqual(b);
  });

  it("fails fast on bad input", async () => {
    await expect(
      QuantizationCuresV1.render({ method: "magic" as never }, targetCtx(W, H)),
    ).rejects.toThrow(/naive \| inset \| snap \| rects/);
    await expect(
      QuantizationCuresV1.render({ checkerColor: "blue" }, targetCtx(W, H)),
    ).rejects.toThrow(/#rrggbb/);
    await expect(
      QuantizationCuresV1.render({}, targetCtx(320, 200)),
    ).rejects.toThrow(/at least 360x240/);
  });
});
