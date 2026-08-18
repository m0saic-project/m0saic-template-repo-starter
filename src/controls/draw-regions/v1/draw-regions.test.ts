import { asDocument, targetCtx } from "../../../__testutils__/render";
import { DrawRegionsV1 } from "./draw-regions";

const render = (
  props: Parameters<typeof DrawRegionsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => DrawRegionsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/draw-regions/v1", () => {
  it("declares the regions picker with its tool set", () => {
    const meta = DrawRegionsV1.propsSchema?.regions?.meta;
    expect(meta?.control?.picker).toBe("regions");
    expect(meta?.control?.regions).toEqual({
      min: 0,
      max: 6,
      shapes: ["rect", "ellipse", "brush"],
    });
  });

  it("marks received areas with chips, in DRAW order", async () => {
    const doc = await render(); // defaults: two regions
    // scene (3 tiles) + 2 x (chip + label) + caption
    expect(doc.sources).toHaveLength(3 + 4 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("2 areas received, in draw order");
    expect(t).toContain("the handshake is the product");
  });

  it("accepts the tolerant wire shapes identically: wrapper, bare array, JSON string", async () => {
    const rects = [{ x: 100, y: 100, w: 200, h: 150 }];
    const asWrapper = await render({ regions: { canvas: { w: 1280, h: 720 }, regions: rects } });
    const asBare = await render({ regions: rects });
    const asString = await render({
      regions: JSON.stringify({ canvas: { w: 1280, h: 720 }, regions: rects }),
    });
    expect(asWrapper).toEqual(asBare);
    expect(asWrapper).toEqual(asString);
  });

  it("rescales authored-canvas coordinates to the render canvas", async () => {
    // Same region authored against two canvases → same picture proportionally.
    const at1280 = await render({
      regions: { canvas: { w: 1280, h: 720 }, regions: [{ x: 320, y: 180, w: 320, h: 180 }] },
    });
    const at640 = await render({
      regions: { canvas: { w: 640, h: 360 }, regions: [{ x: 160, y: 90, w: 160, h: 90 }] },
    });
    expect(at1280.m0).toEqual(at640.m0);
  });

  it("ZERO regions is the working base case, not an error", async () => {
    const doc = await render({ regions: { regions: [] } });
    expect(doc.kind).toBe("mosaic_document");
    expect(doc.sources).toHaveLength(3 + 1); // scene + caption only
    expect(text(doc)).toContain("the scene is waiting");
  });

  it("a malformed value gets a report card naming the wire", async () => {
    const doc = await render({ regions: { regions: [{ x: "left", y: 0 }] } });
    const t = text(doc);
    expect(t).toContain("Marked areas do not parse");
    expect(t).toContain("{ canvas?, regions: [{x, y, w, h}, ...] }");
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
