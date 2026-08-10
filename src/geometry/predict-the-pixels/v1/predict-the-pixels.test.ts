import type { MosaicTextSource } from "@m0saic/types";

import { outsideInSizes } from "../../../_shared/geometry";
import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PredictThePixelsV1 } from "./predict-the-pixels";

describe("outside-in remainder rule", () => {
  it("reproduces the locked engine example: 4 tiles at 103px", () => {
    expect(outsideInSizes(103, 4)).toEqual([26, 26, 25, 26]);
  });

  it("is exact when the axis divides evenly", () => {
    expect(outsideInSizes(1280, 4)).toEqual([320, 320, 320, 320]);
  });

  it("hands remainder pixels to the edges first", () => {
    // 10 = 3*3 + 1 → the single spare pixel goes to index 0.
    expect(outsideInSizes(10, 3)).toEqual([4, 3, 3]);
    // 11 = 3*3 + 2 → indexes 0 and 2 (the edges).
    expect(outsideInSizes(11, 3)).toEqual([4, 3, 4]);
  });

  it("always sums back to the axis", () => {
    for (const [total, count] of [
      [1031, 7],
      [499, 12],
      [1920, 11],
    ] as const) {
      const sizes = outsideInSizes(total, count);
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(total);
    }
  });
});

describe("@m0saic-starter/geometry/predict-the-pixels/v1", () => {
  it("labels every tile with its predicted width", async () => {
    const doc = asDocument(
      await PredictThePixelsV1.render({ tileCount: 4 }, targetCtx(103, 720)),
    );
    // Base fills + label overlay mirror the same split.
    expect(doc.m0).toBe("4(1,1,1,1){4(1,1,1,1)}");
    expect(doc.sources).toHaveLength(8);

    const labelTexts = (doc.sources ?? [])
      .filter((s) => s.type === "text")
      .map((s) => ((s as MosaicTextSource).layers[0]?.content as { text?: string }).text);
    expect(labelTexts).toEqual(["26px", "26px", "25px", "26px"]);
  });

  it("fails fast on an out-of-range tile count", async () => {
    await expect(
      PredictThePixelsV1.render({ tileCount: 1 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/2-12/);
  });
});
