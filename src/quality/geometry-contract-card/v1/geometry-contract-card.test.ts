import { asDocument, targetCtx } from "../../../__testutils__/render";
import { GeometryContractCardV1 } from "./geometry-contract-card";

const ctx = targetCtx(1280, 720);

const render = (
  props: Parameters<typeof GeometryContractCardV1.render>[0],
  c = ctx,
) => GeometryContractCardV1.render(props, c).then(asDocument);

type Stamped = {
  editor?: {
    geometryContract?: {
      ok: boolean;
      violations: { detail: string }[];
      matched: { name?: string; stableKey?: string; sourceIndex?: number }[];
    };
  };
};
const contract = (doc: unknown) => (doc as Stamped).editor?.geometryContract;

describe("@m0saic-starter/quality/geometry-contract-card/v1", () => {
  it("is FREE when debug is off — the document comes back untouched", async () => {
    const doc = await render({ contractOffsetPx: 40 });
    expect(doc.kind).toBe("mosaic_document");
    expect(contract(doc)).toBeUndefined();
  });

  it("the honest declaration holds at every canvas", async () => {
    for (const [w, h] of [
      [1280, 720],
      [1080, 1920],
      [640, 360],
      [1920, 1080],
    ] as const) {
      const doc = await render({ debugGeometry: true }, targetCtx(w, h));
      expect(contract(doc)?.ok).toBe(true);
    }
  });

  it("a mismatch past tolerance is caught, with both numbers in the message", async () => {
    const doc = await render({ debugGeometry: true, contractOffsetPx: 8 });
    const stamp = contract(doc);
    expect(stamp?.ok).toBe(false);
    // 720 / 6 = 120 realized; the contract asks for 8 more.
    expect(stamp?.violations[0].detail).toContain("intended 128");
    expect(stamp?.violations[0].detail).toContain("realized 120");
  });

  /**
   * `tolerancePx` defaults to 1 because an exact ratio still lands on
   * integers — ±1px is healthy rounding, not a defect. A lesson that
   * invited you to try 1 and watch nothing happen would read as broken, so
   * the boundary is stated in the caption and locked here.
   */
  it("1px is INSIDE the default tolerance and passes; 2px crosses it", async () => {
    expect(contract(await render({ debugGeometry: true, contractOffsetPx: 1 }))?.ok).toBe(true);
    expect(contract(await render({ debugGeometry: true, contractOffsetPx: 2 }))?.ok).toBe(false);
  });

  it("the chip itself never moves — only the contract's target does", async () => {
    // Same realized geometry at every offset; the m0 is identical.
    const at0 = await render({ contractOffsetPx: 0 });
    const at8 = await render({ contractOffsetPx: 8 });
    expect(at8.m0).toBe(at0.m0);
    expect(JSON.stringify(at8.sources?.[2])).toBe(JSON.stringify(at0.sources?.[2]));
  });

  /**
   * The lesson's own hazard, locked. A stableKey selects the frame the
   * assertion runs against; select the WRONG one and the check still passes —
   * silently, against something you did not mean.
   *
   * This is not hypothetical: the first draft of this template hand-wrote its
   * m0 as `6[1{1},0,0,0,0,1]`, forgetting that a `0` donates to the NEXT
   * tile. The chip got five sixths of the canvas and the contract caught it.
   */
  it("selects the CHIP — the band that is one sixth of the canvas", async () => {
    const doc = await render({ debugGeometry: true });
    const match = contract(doc)?.matched?.[0];
    expect(match?.name).toBe("chip");
    // sources = [card, card-text, chip] — the chip is the last.
    expect(match?.sourceIndex).toBe(2);
    // And the split really does put the small band last.
    expect(doc.m0).toBe("6[0,0,0,0,1{1},1]");
  });

  it("the caption names both numbers and says where the line is", async () => {
    // The caption is word-wrapped to fit its band, so line breaks land
    // wherever the fitter puts them — match on the flattened text.
    const captionOf = async (contractOffsetPx: number) =>
      JSON.stringify(await render({ contractOffsetPx })).replace(/\\n/g, " ");

    expect(await captionOf(0)).toContain("contract wants 120px, chip is 120px");
    // The one that would otherwise look broken explains itself.
    expect(await captionOf(1)).toContain("inside the 1px tolerance");
    expect(await captionOf(8)).toContain("past the 1px tolerance");
  });

  it("rejects bad props", async () => {
    await expect(render({ contractOffsetPx: 999 })).rejects.toThrow(/out of range/);
    await expect(render({ chipColor: "teal" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    const a = await render({ debugGeometry: true });
    const b = await render({ debugGeometry: true });
    expect(a).toEqual(b);
  });
});
