import { asDocument, defaultCtx } from "../../../__testutils__/render";
import { ColorTilesV1 } from "./color-tiles";

describe("@m0saic-starter/basics/color-tiles/v1", () => {
  it("maps one lavfi color tile onto each column, in order", async () => {
    const doc = asDocument(
      await ColorTilesV1.render({ ...ColorTilesV1.defaultProps }, defaultCtx),
    );

    // Default gap 1: null cells around and between the three tiles.
    expect(doc.m0).toContain("-");
    expect(doc.sources).toHaveLength(3);
    expect(doc.sources?.map((s) => s.type)).toEqual(["lavfi", "lavfi", "lavfi"]);
    expect((doc.sources?.[0] as { color?: string }).color).toBe("#c0392b");
    expect((doc.sources?.[2] as { color?: string }).color).toBe("#2471a3");
  });

  it("sets document.backgroundColor instead of spending a base tile", async () => {
    const doc = asDocument(await ColorTilesV1.render({}, defaultCtx));
    expect(doc.backgroundColor).toBe("#0b0e11");
  });

  it("column count follows the colors array", async () => {
    const doc = asDocument(
      await ColorTilesV1.render(
        { colors: ["#111111", "#222222"], gap: 0 },
        defaultCtx,
      ),
    );
    expect(doc.m0).toBe("2(1,1)");
    expect(doc.sources).toHaveLength(2);
  });

  it("gap 0 = edge to edge: no nulls, so no background is ever visible", async () => {
    const doc = asDocument(await ColorTilesV1.render({ gap: 0 }, defaultCtx));
    expect(doc.m0).toBe("3(1,1,1)");
    expect(doc.m0).not.toContain("-");
  });

  it("a gap weaves NULL cells that claim space but never a source", async () => {
    // This is what makes document.backgroundColor visible at all — and
    // nulls are not frames, so the source list is untouched by the gap.
    const wide = asDocument(await ColorTilesV1.render({ gap: 6 }, defaultCtx));
    const narrow = asDocument(await ColorTilesV1.render({ gap: 1 }, defaultCtx));
    expect(wide.m0).toContain("-");
    expect(wide.sources).toHaveLength(3);
    expect(narrow.sources).toHaveLength(3);
    // Wider gaps mean the tiles claim a smaller share of the same canvas.
    expect(wide.m0).not.toBe(narrow.m0);
  });

  it("fails fast on bad input", async () => {
    await expect(
      ColorTilesV1.render({ colors: ["#111111"] }, defaultCtx),
    ).rejects.toThrow(/2-8 entries/);
    await expect(
      ColorTilesV1.render({ colors: ["#111111", "nope"] }, defaultCtx),
    ).rejects.toThrow(/#rrggbb/);
    await expect(
      ColorTilesV1.render({ gap: 9 }, defaultCtx),
    ).rejects.toThrow(/integer 0-6/);
  });
});
