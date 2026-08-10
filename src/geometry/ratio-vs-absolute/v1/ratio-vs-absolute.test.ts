import type { MosaicTextSource } from "@m0saic/types";
import { findFrames } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RatioVsAbsoluteV1 } from "./ratio-vs-absolute";

/** Leaf columns of one band, left-to-right, in root-canvas px. */
async function bandCols(
  width: number,
  height: number,
  band: "top" | "bottom",
  props: Parameters<typeof RatioVsAbsoluteV1.render>[0] = {},
) {
  const doc = asDocument(await RatioVsAbsoluteV1.render(props, targetCtx(width, height)));
  const halfH = Math.floor(height / 2);
  const cols = findFrames(
    doc.m0,
    (f) =>
      f.kind === "frame" &&
      f.overlayDepth === 0 &&
      f.width < width &&
      (band === "top" ? f.y < halfH : f.y >= halfH),
    { width, height },
  );
  return cols.sort((a, b) => a.x - b.x);
}

describe("@m0saic-starter/geometry/ratio-vs-absolute/v1", () => {
  it("keeps the ratio band's string canvas-independent", async () => {
    const at1280 = asDocument(await RatioVsAbsoluteV1.render({}, targetCtx(1280, 720)));
    const at1920 = asDocument(await RatioVsAbsoluteV1.render({}, targetCtx(1920, 1080)));
    // The ratio spelling appears verbatim in both.
    expect(at1280.m0).toContain("4(1,0,1,1)");
    expect(at1920.m0).toContain("4(1,0,1,1)");
  });

  it("scales the ratio sides but PINS the absolute rails across canvases", async () => {
    // THE lesson, as geometry: grow the canvas 1280 → 1920 and the ratio
    // band's side columns scale (~quarter each) while the absolute band's
    // rails hold at the default 240px pin.
    const top1280 = await bandCols(1280, 720, "top");
    const top1920 = await bandCols(1920, 1080, "top");
    expect(top1280).toHaveLength(3);
    expect(Math.abs(top1280[0].width - 320)).toBeLessThanOrEqual(1);
    expect(Math.abs(top1920[0].width - 480)).toBeLessThanOrEqual(1);

    const bot1280 = await bandCols(1280, 720, "bottom");
    const bot1920 = await bandCols(1920, 1080, "bottom");
    expect(bot1280).toHaveLength(3);
    expect(bot1280[0].width).toBe(240);
    expect(bot1280[2].width).toBe(240);
    expect(bot1920[0].width).toBe(240);
    expect(bot1920[2].width).toBe(240);
    // ...and the middle absorbed the growth.
    expect(bot1920[1].width - bot1280[1].width).toBe(1920 - 1280);
  });

  it("the two bands spell DIFFERENT strings at a canvas where px ≠ quarter", async () => {
    const doc = asDocument(await RatioVsAbsoluteV1.render({}, targetCtx(1280, 720)));
    // Rails 240 at 1280 wide is not 1:2:1, so the ratio spelling appears
    // exactly once — the absolute band bakes something else.
    expect((doc.m0.match(/4\(1,0,1,1\)/g) ?? []).length).toBe(1);
  });

  it("collides into ONE spelling when a quarter IS the rail (960 @ 240)", async () => {
    const doc = asDocument(await RatioVsAbsoluteV1.render({}, targetCtx(960, 720)));
    // 240/480/240 canonicalizes to the same tokens as 1:2:1 — the
    // coincidence the tutorial teaches.
    expect((doc.m0.match(/4\(1,0,1,1\)/g) ?? []).length).toBe(2);
  });

  it("clamps an infeasible rail and says so on the caption", async () => {
    const doc = asDocument(
      await RatioVsAbsoluteV1.render({ railPx: 500 }, targetCtx(1280, 720)),
    );
    const captions = (doc.sources ?? [])
      .filter((s) => s.type === "text")
      .map((s) =>
        String(
          ((s as MosaicTextSource).layers[0]?.content as { text?: string }).text ?? "",
        ).replace(/\n/g, " "),
      );
    // floor(1280 * 0.3) = 384
    expect(captions.some((c) => c.includes("384px (clamped from 500)"))).toBe(true);
    const bot = await bandCols(1280, 720, "bottom", { railPx: 500 });
    expect(bot[0].width).toBe(384);
  });

  it("binds a source per frame: 3 ratio fills + N absolute fills + 2 labels", async () => {
    const doc = asDocument(await RatioVsAbsoluteV1.render({}, targetCtx(1280, 720)));
    const fills = (doc.sources ?? []).filter((s) => s.type === "lavfi");
    const labels = (doc.sources ?? []).filter((s) => s.type === "text");
    expect(labels).toHaveLength(2);
    expect(fills.length).toBeGreaterThanOrEqual(6); // 3 ratio + ≥3 absolute
    expect(doc.sources?.length).toBe(fills.length + labels.length);
  });

  it("is deterministic per target", async () => {
    const a = await RatioVsAbsoluteV1.render({}, targetCtx(1280, 720));
    const b = await RatioVsAbsoluteV1.render({}, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });

  it("fails fast on bad input", async () => {
    await expect(
      RatioVsAbsoluteV1.render({ absoluteColor: "green" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
    await expect(
      RatioVsAbsoluteV1.render({ railPx: 39.5 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/integer 40-1000/);
    await expect(
      RatioVsAbsoluteV1.render({ railPx: 2000 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/integer 40-1000/);
  });
});
