import type { MosaicDocument } from "@m0saic/types";
import { resolvePropBindings } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PropBindingsV1, lineSpans } from "./prop-bindings";

const defaults = PropBindingsV1.defaultProps as Required<Parameters<typeof PropBindingsV1.render>[0]>;
const render = (
  props: Parameters<typeof PropBindingsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => PropBindingsV1.render({ ...defaults, ...props }, targetCtx(w, h)).then(asDocument);
const resolve = (doc: MosaicDocument, w = 1280, h = 720) =>
  resolvePropBindings(doc, w, h, { propsSchema: PropBindingsV1.propsSchema });

describe("@m0saic-starter/make/prop-bindings/v1", () => {
  it("every binding resolves, and every bindable kind is on the card (the two gate rules)", async () => {
    const doc = await render();
    const { byProp, rejected } = resolve(doc);
    expect(rejected).toEqual([]);

    // free text (scalar) + header OVER subtitle: two knobs, ONE source
    expect(byProp.title).toHaveLength(1);
    expect(byProp.subtitle).toHaveLength(1);
    expect(byProp.title[0]).toMatchObject({ kind: "string", layer: 0, childPath: [] });
    expect(byProp.subtitle[0]).toMatchObject({ kind: "string", layer: 1 });
    expect(byProp.subtitle[0].sourceIndex).toBe(byProp.title[0].sourceIndex);

    // a colour string binds with kind "color" - the swatch opens a picker
    expect(byProp.accentColor).toHaveLength(1);
    expect(byProp.accentColor[0].kind).toBe("color");

    // a number
    expect(byProp.count).toHaveLength(1);
    expect(byProp.count[0]).toMatchObject({ kind: "number" });
    expect("index" in byProp.count[0]).toBe(false);

    // one element of a number[] / string[] per rect - the list itself is never bound
    expect(byProp.scores.map((b) => b.index)).toEqual([0, 1, 2]);
    expect(byProp.scores.every((b) => b.kind === "number")).toBe(true);
    expect(byProp.bullets.map((b) => b.index)).toEqual([0, 1, 2]);
    expect(byProp.bullets.map((b) => b.path)).toEqual([[0], [1], [2]]);

    // leaves of a json row list - path AND kind, all three leaf kinds
    expect(byProp.rows.map((b) => [b.path, b.kind])).toEqual([
      [[0, "name"], "string"],
      [[0, "value"], "number"],
      [[0, "color"], "color"],
      [[1, "name"], "string"],
      [[1, "value"], "number"],
      [[1, "color"], "color"],
    ]);

    // one line of a multi-line string - range + focus
    expect(byProp.code).toHaveLength(3);

    // closed set: drawn as a chip, never bound; the backdrop fill is not drawn text
    expect(byProp.mode).toBeUndefined();
    expect(byProp.pageColor).toBeUndefined();
  });

  it("bindPropRange spans index the RAW code string - each rect edits exactly one line", async () => {
    const code = defaults.code;
    const spans = lineSpans(code);
    expect(spans.map((s) => code.slice(s.range.start, s.range.end))).toEqual(code.split("\n"));
    expect(spans.map((s) => code.slice(s.focus.start, s.focus.end))).toEqual(["const", "bindProp(src,", "return"]);

    const { byProp } = resolve(await render());
    expect(byProp.code.map((b) => b.range)).toEqual(spans.map((s) => s.range));
    expect(byProp.code.map((b) => b.focus)).toEqual(spans.map((s) => s.focus));
  });

  it("a closed picker is NOT bindable - the same predicate Make uses rejects it", async () => {
    const doc = await render();
    // Pretend the chip had been bound: the platform refuses it.
    const chip = doc.sources.findIndex((s) => JSON.stringify(s).includes("mode: boxed"));
    expect(chip).toBeGreaterThan(-1);
    const forged = JSON.parse(JSON.stringify(doc)) as MosaicDocument;
    (forged.sources[chip] as { editor?: { binding?: unknown } }).editor = { binding: { propKey: "mode" } };
    const { rejected } = resolve(forged);
    expect(rejected).toMatchObject([{ propKey: "mode", reason: "unsupported-type" }]);
  });

  it("bindings ride the SOURCE, not the per-render stableKey - the prop map survives a re-key", async () => {
    const wide = resolve(await render({}, 1280, 720), 1280, 720);
    const narrow = resolve(await render({}, 640, 360), 640, 360);
    expect(Object.keys(narrow.byProp).sort()).toEqual(Object.keys(wide.byProp).sort());
    expect(narrow.byProp.rows.map((b) => b.path)).toEqual(wide.byProp.rows.map((b) => b.path));
  });

  it("a rect stays bound when its value is empty - the empty rect is the add handle", async () => {
    const r = resolve(await render({ bullets: ["", "two"], subtitle: "" }));
    expect(r.rejected).toEqual([]);
    expect(r.byProp.bullets.map((b) => b.index)).toEqual([0, 1]);
    expect(r.byProp.subtitle).toHaveLength(1);
  });

  it("the values reach the rects that bind them", async () => {
    const doc = await render({ title: "Hello", subtitle: "there", accentColor: "#123456", count: 12, scores: [1, 2] });
    const t = JSON.stringify(doc);
    for (const s of ["Hello", "there", "#123456", '"12"', '"1"', '"2"']) expect(t).toContain(s);
    expect(resolve(doc).byProp.scores.map((b) => b.index)).toEqual([0, 1]);
  });

  it("render() is the gate: rejects over-long lists, bad numbers, bad colours, an off-list mode", async () => {
    await expect(render({ bullets: ["a", "b", "c", "d", "e"] })).rejects.toThrow(/up to 4 strings/);
    await expect(render({ scores: [1, 2, 3, 4, 5] })).rejects.toThrow(/up to 4 numbers/);
    await expect(render({ count: -1 })).rejects.toThrow(/count must be/);
    await expect(render({ accentColor: "red" })).rejects.toThrow(/#rrggbb/);
    await expect(render({ mode: "fancy" as never })).rejects.toThrow(/mode must be one of/);
    await expect(render({ rows: [{ name: "x", value: "42", color: "#000000" }] as never })).rejects.toThrow(/rows must be/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
