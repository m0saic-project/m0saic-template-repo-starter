import { roundedRectPathD } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ShapeMasksV1 } from "./shape-masks";

type Masked = { type: string; mask: { kind: string; localPath: string; bounds: { width: number; height: number } } };

const maskedOf = (doc: { sources?: unknown[] }): Masked =>
  (doc.sources ?? [])[0] as Masked;

const render = (props: Parameters<typeof ShapeMasksV1.render>[0], w = 1280, h = 720) =>
  ShapeMasksV1.render(props, targetCtx(w, h)).then(asDocument);

describe("@m0saic-starter/masks/shape-masks/v1", () => {
  it("every shape is one color tile wearing a path — no shape primitives", async () => {
    for (const shape of ["circle", "ellipse", "rounded-rect", "pill"] as const) {
      const doc = await render({ shape });
      const src = maskedOf(doc);
      expect(src.type).toBe("lavfi");
      expect(src.mask.kind).toBe("inline-mask");
      expect(src.mask.localPath.length).toBeGreaterThan(10);
      // Bounds are the CELL (middle column of 1:6:1, above the caption band).
      expect(src.mask.bounds).toEqual({ x: 0, y: 0, width: 960, height: 600 });
    }
  });

  it("the circle takes its radius from the SHORT side (equal rx/ry)", async () => {
    const doc = await render({ shape: "circle" });
    // "A rx ry ..." — a circle's two radii are equal, an ellipse's are not.
    const arc = /A (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) /.exec(maskedOf(doc).mask.localPath);
    expect(arc).not.toBeNull();
    expect(arc?.[1]).toBe(arc?.[2]);

    const ellipse = await render({ shape: "ellipse" });
    const eArc = /A (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) /.exec(maskedOf(ellipse).mask.localPath);
    expect(eArc?.[1]).not.toBe(eArc?.[2]);
  });

  it("pill IS rounded-rect at half the short side (same helper, same string)", async () => {
    const pill = await render({ shape: "pill" });
    // Recompute independently: cell 960x600, inset = round(600*0.06) = 36.
    const inset = 36;
    const w = 960 - inset * 2;
    const h = 600 - inset * 2;
    const expected = roundedRectPathD(inset, inset, w, h, Math.round(h / 2));
    expect(maskedOf(pill).mask.localPath).toBe(expected);

    // And a rounded-rect at 50% lands on the same clamped corner.
    const maxed = await render({ shape: "rounded-rect", cornerPct: 50 });
    expect(maskedOf(maxed).mask.localPath).toBe(expected);
  });

  it("corner radius scales with the cell, not with a hardcoded number", async () => {
    const wide = await render({ shape: "rounded-rect", cornerPct: 20 }, 1280, 720);
    const small = await render({ shape: "rounded-rect", cornerPct: 20 }, 640, 360);
    expect(maskedOf(wide).mask.localPath).not.toBe(maskedOf(small).mask.localPath);
    expect(maskedOf(small).mask.bounds).toEqual({ x: 0, y: 0, width: 480, height: 300 });
  });

  it("a square corner is a plain rect (the helper's r <= 0 branch)", async () => {
    const doc = await render({ shape: "rounded-rect", cornerPct: 0 });
    expect(maskedOf(doc).mask.localPath).not.toContain("A"); // no arcs at all
  });

  it("reports every bad prop at once", async () => {
    await expect(
      ShapeMasksV1.render(
        { shape: "blob" as never, cornerPct: 90, shapeColor: "orange" },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/shape must be one of.*cornerPct must be 0-50.*shapeColor/s);
  });
});
