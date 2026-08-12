import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ReduceToOneV1 } from "./reduce-to-one";

const render = (props: Parameters<typeof ReduceToOneV1.render>[0]) =>
  ReduceToOneV1.render(props, targetCtx(1280, 720)).then(asDocument);

const childOf = (doc: { children?: Record<string, unknown> }) =>
  (doc.children ?? {})["field"] as { m0: string; size: { width: number }; sources: unknown[] };

describe("@m0saic-starter/compose/reduce-to-one/v1", () => {
  it("draws the same cell count either way", async () => {
    const flat = await render({ mode: "flat", density: 6 });
    const reduced = await render({ mode: "reduced", density: 6 });

    // Flat: 36 cells + caption. Reduced: 1 mosaic ref + caption, 36 in the child.
    expect(flat.sources).toHaveLength(37);
    expect(reduced.sources).toHaveLength(2);
    expect(childOf(reduced).sources).toHaveLength(36);
  });

  it("only the flat spelling's m0 grows with density", async () => {
    const flatSmall = await render({ mode: "flat", density: 3 });
    const flatBig = await render({ mode: "flat", density: 12 });
    const reducedSmall = await render({ mode: "reduced", density: 3 });
    const reducedBig = await render({ mode: "reduced", density: 12 });

    expect(flatBig.m0.length).toBeGreaterThan(flatSmall.m0.length * 2);
    expect(reducedBig.m0).toBe(reducedSmall.m0); // byte-identical parent
    expect(reducedBig.m0.length).toBeLessThan(flatBig.m0.length);
  });

  it("the child owns a declared coordinate space", async () => {
    const doc = await render({ mode: "reduced", density: 4 });
    expect(childOf(doc).size).toEqual({ width: 1280, height: 600 });
    expect(doc.sources?.[0]).toMatchObject({ type: "mosaic", ref: "field" });
  });

  it("carries no children at all in flat mode", async () => {
    const doc = await render({ mode: "flat" });
    expect(doc.children).toBeUndefined();
  });

  it("prints the other spelling's cost as a number", async () => {
    const flat = await render({ mode: "flat", density: 8 });
    const reduced = await render({ mode: "reduced", density: 8 });
    // The caption is the lesson's receipt — each mode quotes the other.
    expect(JSON.stringify(flat.sources)).toContain("extra encode pass");
    expect(JSON.stringify(reduced.sources)).toContain(`flat would be ${flat.m0.length}`);
  });

  it("refuses a density the grammar can't spell", async () => {
    await expect(ReduceToOneV1.render({ density: 1 }, targetCtx(1280, 720))).rejects.toThrow(
      /density must be a whole number 2-12/,
    );
  });
});
