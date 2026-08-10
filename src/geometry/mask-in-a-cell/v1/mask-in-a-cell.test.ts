import { asDocument, targetCtx } from "../../../__testutils__/render";
import { MaskInACellV1 } from "./mask-in-a-cell";

type MaskedTile = {
  type: string;
  mask?: {
    kind?: string;
    localPath?: string;
    bounds?: { width: number; height: number };
  };
};

describe("@m0saic-starter/geometry/mask-in-a-cell/v1", () => {
  it("builds the shape as a masked color tile in a plain ratio cell", async () => {
    const doc = asDocument(await MaskInACellV1.render({}, targetCtx(1280, 720)));
    // Caption overlay claims only the bottom sixth — tight text binding.
    expect(doc.m0).toBe("3(-,1,-){6[-,-,-,-,-,1]}");

    const tile = doc.sources?.[0] as MaskedTile;
    expect(tile.type).toBe("lavfi");
    expect(tile.mask?.kind).toBe("inline-mask");
    expect(tile.mask?.localPath).toMatch(/^M .* Z$/);
  });

  it("matched mode shapes the bounds like the cell", async () => {
    const doc = asDocument(await MaskInACellV1.render({}, targetCtx(1280, 720)));
    const bounds = (doc.sources?.[0] as MaskedTile).mask?.bounds;
    // Cell = center third of 1280x720 → ~427x720.
    expect(bounds?.width).toBe(Math.round(1280 / 3));
    expect(bounds?.height).toBe(720);
  });

  it("smear mode keeps square bounds — the mismatch under a non-square cell", async () => {
    const doc = asDocument(
      await MaskInACellV1.render({ matchAspect: false }, targetCtx(1280, 720)),
    );
    const bounds = (doc.sources?.[0] as MaskedTile).mask?.bounds;
    expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      MaskInACellV1.render({ shapeColor: "red" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
