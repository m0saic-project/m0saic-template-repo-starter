import { asDocument, targetCtx } from "../../../__testutils__/render";
import { NestedBadgeV1 } from "./nested-badge";

const labelOf = (doc: { sources?: unknown[] }) =>
  (doc.sources ?? [])[2] as {
    layers: { content: { text: string }; style: { fontSize: number } }[];
  };

describe("@m0saic-starter/compose/nested-badge/v1", () => {
  it("is marked internal but renders standalone", async () => {
    // internal is about INTENT, not capability — opening a child directly is
    // how you debug one.
    expect(NestedBadgeV1.internal).toBe(true);
    const doc = asDocument(await NestedBadgeV1.render({}, targetCtx(384, 720)));
    expect(doc.sources).toHaveLength(3);
  });

  it("sizes everything off ctx.target, so a sliver and a canvas both work", async () => {
    const sliver = asDocument(await NestedBadgeV1.render({ text: "nested" }, targetCtx(384, 720)));
    const canvas = asDocument(await NestedBadgeV1.render({ text: "nested" }, targetCtx(1280, 720)));
    // Same structure, different fitted size — laid out for the box it was given.
    expect(sliver.m0).toBe(canvas.m0);
    expect(labelOf(sliver).layers[0].style.fontSize).toBeLessThan(
      labelOf(canvas).layers[0].style.fontSize,
    );
  });

  it("reports bad text and color together", async () => {
    await expect(
      NestedBadgeV1.render({ text: "", accent: "orange" }, targetCtx(384, 720)),
    ).rejects.toThrow(/text must be 1-24.*accent/s);
  });
});
