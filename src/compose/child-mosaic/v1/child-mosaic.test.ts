import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ChildMosaicV1 } from "./child-mosaic";

const render = (props: Parameters<typeof ChildMosaicV1.render>[0]) =>
  ChildMosaicV1.render(props, targetCtx(1280, 720)).then(asDocument);

const childOf = (doc: { children?: Record<string, unknown> }) =>
  (doc.children ?? {})["grid"] as {
    kind: string;
    m0: string;
    size?: { width: number; height: number };
    sources: unknown[];
  };

describe("@m0saic-starter/compose/child-mosaic/v1", () => {
  it("puts a complete document behind one tile", async () => {
    const doc = await render({});
    const child = childOf(doc);
    expect(child.kind).toBe("mosaic_document");
    expect(child.sources).toHaveLength(9); // 3x3
    // The parent's third source is the reference, not the content.
    expect(doc.sources?.[2]).toMatchObject({ type: "mosaic", ref: "grid" });
  });

  it("the child grows while the PARENT's m0 stays byte-identical", async () => {
    const two = await render({ childGrid: 2 });
    const five = await render({ childGrid: 5 });

    expect(two.m0).toBe(five.m0); // shape is shape
    expect(childOf(two).sources).toHaveLength(4);
    expect(childOf(five).sources).toHaveLength(25);
    expect(childOf(five).m0).not.toBe(childOf(two).m0);
  });

  it("declares the child's size only when asked (its one aspect signal)", async () => {
    const declared = await render({ declareChildSize: true });
    const inherited = await render({ declareChildSize: false });
    expect(childOf(declared).size).toEqual({ width: 720, height: 720 });
    expect(childOf(inherited).size).toBeUndefined();
    // Same drawing either way — only the aspect signal changed.
    expect(childOf(declared).m0).toBe(childOf(inherited).m0);
  });

  it("refuses a grid the m0 grammar can't spell", async () => {
    // A 1-cell split is illegal DSL (`1(1)`), so the floor is 2 — better a
    // named error here than an engine parse failure downstream.
    await expect(ChildMosaicV1.render({ childGrid: 1 }, targetCtx(1280, 720))).rejects.toThrow(
      /childGrid must be a whole number 2-5/,
    );
    await expect(ChildMosaicV1.render({ childGrid: 3.5 }, targetCtx(1280, 720))).rejects.toThrow(
      /whole number/,
    );
  });

  it("renders the same document twice for the same inputs", async () => {
    const once = await render({ childGrid: 4 });
    const twice = await render({ childGrid: 4 });
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });
});
