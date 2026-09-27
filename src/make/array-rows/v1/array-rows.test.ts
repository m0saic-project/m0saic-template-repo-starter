import type { MosaicDocument } from "@m0saic/types";
import { resolvePropBindings } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ArrayRowsV1, DEFAULT_ITEMS, MAX_ROWS, nextSku, parseItems } from "./array-rows";
import type { ArrayRow } from "./array-rows";

type LeafBinding = { path?: Array<string | number>; kind?: string; onClear?: string; seedDraft?: string };

const render = (
  props: Parameters<typeof ArrayRowsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => ArrayRowsV1.render({ ...ArrayRowsV1.defaultProps, ...props }, targetCtx(w, h)).then(asDocument);
const resolve = (doc: MosaicDocument, w = 1280, h = 720) =>
  resolvePropBindings(doc, w, h, { propsSchema: ArrayRowsV1.propsSchema });
const rawBindings = (doc: MosaicDocument): LeafBinding[] =>
  doc.sources
    .map((s) => (s as { editor?: { binding?: LeafBinding } }).editor?.binding)
    .filter((b): b is LeafBinding => Boolean(b));

const sixRows: ArrayRow[] = Array.from({ length: MAX_ROWS }, (_, i) => ({ sku: `SKU-00${i + 1}`, qty: i, color: "#2e86c1" }));

describe("@m0saic-starter/make/array-rows/v1", () => {
  it("⭐ declares the array plainly: type array, flavor objectRows, one column per leaf", () => {
    const items = ArrayRowsV1.propsSchema?.items as unknown as {
      type: string;
      meta?: { control?: { flavor?: string; columns?: Array<{ key: string; kind: string }> } };
    };
    expect(items.type).toBe("array");
    expect(items.meta?.control?.flavor).toBe("objectRows");
    expect(items.meta?.control?.columns?.map((c) => [c.key, c.kind])).toEqual([
      ["sku", "text"],
      ["qty", "number"],
      ["color", "color"],
    ]);
  });

  it("⭐ every cell is a leaf handle - path AND kind - and the empty last row is the add handle", async () => {
    const { byProp, rejected } = resolve(await render());
    expect(rejected).toEqual([]);
    expect(Object.keys(byProp)).toEqual(["items"]);
    expect(byProp.items.map((b) => [b.path, b.kind])).toEqual([
      [[0, "color"], "color"], [[0, "sku"], "string"], [[0, "qty"], "number"],
      [[1, "color"], "color"], [[1, "sku"], "string"], [[1, "qty"], "number"],
      [[2, "color"], "color"], [[2, "sku"], "string"], [[2, "qty"], "number"],
      [[3, "sku"], "string"], // the row that does not exist yet
    ]);
  });

  it("an empty qty removes its row; the add handle seeds the next SKU", async () => {
    const bindings = rawBindings(await render());
    const qty = bindings.filter((b) => b.path?.[1] === "qty");
    expect(qty).toHaveLength(3);
    for (const b of qty) expect(b.onClear).toBe("remove-element");
    const add = bindings.find((b) => b.path?.[0] === DEFAULT_ITEMS.length);
    expect(add).toMatchObject({ kind: "string", seedDraft: "SKU-004" });
    expect(nextSku(DEFAULT_ITEMS)).toBe("SKU-004");
  });

  it("at the row cap there is no add handle - nothing can be appended", async () => {
    const bindings = rawBindings(await render({ items: sixRows }));
    expect(bindings.filter((b) => b.path?.[0] === MAX_ROWS)).toEqual([]);
    expect(bindings.filter((b) => b.path?.[1] === "qty")).toHaveLength(MAX_ROWS);
  });

  it("an empty list is legal - the add handle is then the ONLY handle", async () => {
    const { byProp, rejected } = resolve(await render({ items: [] }));
    expect(rejected).toEqual([]);
    expect(byProp.items.map((b) => b.path)).toEqual([[0, "sku"]]);
  });

  it("render() is the gate - and accepts the JSON-string shape a hand editor produces", async () => {
    expect(await render({ items: JSON.stringify(DEFAULT_ITEMS) })).toEqual(await render());
    expect(parseItems(undefined)).toEqual(DEFAULT_ITEMS);
    await expect(render({ items: [{ sku: "A", qty: -1, color: "#000000" }] })).rejects.toThrow(/qty/);
    await expect(render({ items: [{ sku: "A", qty: 1.5, color: "#000000" }] })).rejects.toThrow(/qty/);
    await expect(render({ items: [{ sku: "", qty: 1, color: "#000000" }] })).rejects.toThrow(/sku/);
    await expect(render({ items: [{ sku: "A", qty: 1, color: "blue" }] })).rejects.toThrow(/color/);
    await expect(render({ items: [...sixRows, sixRows[0]] })).rejects.toThrow(/up to 6/);
    await expect(render({ pageColor: "red" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
