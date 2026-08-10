import type { MosaicTextSource } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PassthroughDonationV1 } from "./passthrough-donation";

function labelTexts(doc: { sources?: unknown[] }): string[] {
  return (doc.sources ?? [])
    .filter((s) => (s as { type?: string }).type === "text")
    .map(
      (s) =>
        ((s as MosaicTextSource).layers[0]?.content as { text?: string }).text ?? "",
    );
}

describe("@m0saic-starter/geometry/passthrough-donation/v1", () => {
  it("renders two tiles from four slots, labels carrying the arithmetic", async () => {
    const doc = asDocument(
      await PassthroughDonationV1.render({}, targetCtx(1280, 720)),
    );
    expect(doc.m0).toBe("4(1,0,0,1){4(1,0,0,1)}");
    // 2 fills + 2 labels — the 0s render nothing of their own.
    expect(doc.sources).toHaveLength(4);

    const labels = labelTexts(doc);
    expect(labels[0]).toBe("1 slot = 25%");
    expect(labels[1]).toContain("0+0+1 = 3 slots = 75%");
  });

  it("scales the donation with the prop", async () => {
    const doc = asDocument(
      await PassthroughDonationV1.render({ donatedSlots: 4 }, targetCtx(1280, 720)),
    );
    expect(doc.m0).toBe("6(1,0,0,0,0,1){6(1,0,0,0,0,1)}");
    const labels = labelTexts(doc);
    expect(labels[1]).toContain("5 slots = 83%");
  });

  it("fails fast on an out-of-range donation", async () => {
    await expect(
      PassthroughDonationV1.render({ donatedSlots: 0 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/1-8/);
  });
});
