import type { MosaicTextSource } from "@m0saic/types";
import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PlaceRectDockV1 } from "./place-rect-dock";

describe("@m0saic-starter/geometry/place-rect-dock/v1", () => {
  it("renders exactly one dock frame plus the caption overlay", async () => {
    const doc = asDocument(await PlaceRectDockV1.render({}, targetCtx(1280, 720)));
    const ev = evaluateM0(doc.m0, { width: 1280, height: 720 });
    expect(ev.frameCount).toBe(2); // dock + caption
    expect(doc.sources?.map((s) => s.type)).toEqual(["lavfi", "text"]);
  });

  it("prints the baked pixel numbers on the caption", async () => {
    const doc = asDocument(await PlaceRectDockV1.render({}, targetCtx(1280, 720)));
    const caption = (
      ((doc.sources?.[1] as MosaicTextSource).layers[0]?.content as { text?: string })
        .text ?? ""
    ).replace(/\n/g, " ");
    // 24% of 1280 = 307, 14% of 720 = 101, margins 32.
    expect(caption).toContain("307x101");
    expect(caption).toContain("(941,587)");
    expect(caption).toContain("baked for 1280x720");
  });

  it("re-bakes the string per canvas — head-only by construction", async () => {
    const a = asDocument(await PlaceRectDockV1.render({}, targetCtx(1280, 720)));
    const b = asDocument(await PlaceRectDockV1.render({}, targetCtx(1920, 1080)));
    expect(a.m0).not.toBe(b.m0);
  });

  it("fails fast on out-of-range knobs", async () => {
    await expect(
      PlaceRectDockV1.render({ widthFrac: 0.9 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/widthFrac/);
    await expect(
      PlaceRectDockV1.render({ dockColor: "gold" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
