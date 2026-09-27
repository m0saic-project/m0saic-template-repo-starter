import type { MosaicDocument } from "@m0saic/types";
import { bindProp, bindProps, resolvePropBindings, svgLabel } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { COMPOSITE_LINE_DEFAULTS, CompositeLineV1, byline } from "./composite-line";

type Bound = { editor?: { binding?: { propKey: string }; bindings?: Array<{ propKey: string; kind?: string }> } };

const render = (
  props: Parameters<typeof CompositeLineV1.render>[0] = {},
  w = 1280,
  h = 720,
) => CompositeLineV1.render({ ...COMPOSITE_LINE_DEFAULTS, ...props }, targetCtx(w, h)).then(asDocument);
const resolve = (doc: MosaicDocument, w = 1280, h = 720) =>
  resolvePropBindings(doc, w, h, { propsSchema: CompositeLineV1.propsSchema });

describe("@m0saic-starter/make/composite-line/v1", () => {
  it("⭐ the composite rect carries BOTH handles - one source, two props", async () => {
    const { byProp, rejected } = resolve(await render());
    expect(rejected).toEqual([]);
    // each prop is bound twice on the card: once on the composite rect, once split
    expect(byProp.handle).toHaveLength(2);
    expect(byProp.year).toHaveLength(2);
    // the FIRST binding of each is the composite rect - the same source
    expect(byProp.handle[0].sourceIndex).toBe(byProp.year[0].sourceIndex);
    expect(byProp.year[0]).toMatchObject({ kind: "number" });
    // the split form puts them on different rects
    expect(byProp.handle[1].sourceIndex).not.toBe(byProp.year[1].sourceIndex);
  });

  it("⭐ a second bindProp REPLACES the first - the pitfall the composite form avoids", () => {
    const twice = bindProp(bindProp(svgLabel("x", 10, 10), "handle"), "year") as Bound;
    expect(twice.editor?.binding).toEqual({ propKey: "year" });
    expect(twice.editor?.bindings).toBeUndefined();

    const both = bindProps(svgLabel("x", 10, 10), [{ propKey: "handle" }, { propKey: "year", kind: "number" }]) as Bound;
    expect(both.editor?.bindings?.map((b) => b.propKey)).toEqual(["handle", "year"]);
  });

  it("the values reach every rect that binds them", async () => {
    const doc = await render({ handle: "@someone", year: 1999 });
    const t = JSON.stringify(doc);
    expect(t).toContain(byline("@someone", 1999));
    expect(t).toContain('"@someone"');
    expect(t).toContain("1999 on GitHub");
  });

  it("a rect stays bound when its value is empty - the empty rect is the add handle", async () => {
    const { byProp, rejected } = resolve(await render({ handle: "" }));
    expect(rejected).toEqual([]);
    expect(byProp.handle).toHaveLength(2);
  });

  it("render() is the gate", async () => {
    await expect(render({ year: 1899 })).rejects.toThrow(/year/);
    await expect(render({ year: 2026.5 })).rejects.toThrow(/year/);
    await expect(render({ handle: 7 as never })).rejects.toThrow(/handle/);
    await expect(render({ pageColor: "red" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
