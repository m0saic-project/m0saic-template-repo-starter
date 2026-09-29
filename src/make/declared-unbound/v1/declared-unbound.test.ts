import type { MosaicDocument } from "@m0saic/types";
import { resolvePropBindings } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { DECLARED_UNBOUND_DEFAULTS, DeclaredUnboundV1, dealOrder, tintsOf } from "./declared-unbound";

const render = (
  props: Parameters<typeof DeclaredUnboundV1.render>[0] = {},
  w = 1280,
  h = 720,
) => DeclaredUnboundV1.render({ ...DECLARED_UNBOUND_DEFAULTS, ...props }, targetCtx(w, h)).then(asDocument);
const resolve = (doc: MosaicDocument, w = 1280, h = 720) =>
  resolvePropBindings(doc, w, h, { propsSchema: DeclaredUnboundV1.propsSchema });

/** The declaration, read the way the gate reads it (the field is 0.3.0 - typed loosely here). */
const declared = (): Record<string, string> =>
  (DeclaredUnboundV1 as unknown as { bindings?: { unbound?: Record<string, string> } }).bindings?.unbound ?? {};

describe("@m0saic-starter/make/declared-unbound/v1", () => {
  it("⭐ the roll call: every prop is bound, declared with a reason, or the document background", async () => {
    const schema = DeclaredUnboundV1.propsSchema ?? {};
    const { byProp, rejected } = resolve(await render());
    expect(rejected).toEqual([]);
    const unbound = declared();
    for (const key of Object.keys(schema)) {
      if (key in byProp) {
        // bound - a declaration here would be STALE, itself a violation
        expect(unbound[key]).toBeUndefined();
      } else if (key === "pageColor") {
        // the document background: no source, no rect, no handle - needs nothing
        expect(unbound[key]).toBeUndefined();
      } else {
        expect(typeof unbound[key]).toBe("string");
        expect(unbound[key].trim().length).toBeGreaterThan(0);
      }
    }
    // and nothing is declared that the schema does not have
    for (const key of Object.keys(unbound)) expect(schema[key as keyof typeof schema]).toBeDefined();
    expect(Object.keys(unbound).sort()).toEqual(["accent", "columns", "gap", "padding", "seed"]);
  });

  it("the label is the ONE handle on the card", async () => {
    const { byProp } = resolve(await render());
    expect(Object.keys(byProp)).toEqual(["label"]);
    expect(byProp.label).toHaveLength(1);
    expect(byProp.label[0]).toMatchObject({ kind: "string" });
  });

  it("columns is a COUNT: it changes how many tiles exist, never a value on one", async () => {
    const six = await render({ columns: 6 });
    const nine = await render({ columns: 9 });
    expect(nine.sources.length - six.sources.length).toBe(3);
  });

  it("seed deals the order deterministically - same seed, same strip; new seed, new deal", async () => {
    expect(await render({ seed: 7 })).toEqual(await render({ seed: 7 }));
    expect(await render({ seed: 7 })).not.toEqual(await render({ seed: 8 }));
    expect(dealOrder(7, 6)).toEqual(dealOrder(7, 6));
    expect([...dealOrder(7, 6)].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("accent is painted on every tile - one family, no single rect", () => {
    const tints = tintsOf("#ee7525", 4);
    expect(tints).toHaveLength(4);
    expect(tints[0]).toBe("#ee7525");
    expect(new Set(tints).size).toBe(4);
    for (const t of tints) expect(t).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("render() is the gate", async () => {
    await expect(render({ columns: 1 })).rejects.toThrow(/columns/);
    await expect(render({ gap: 9 })).rejects.toThrow(/gap/);
    await expect(render({ seed: -1 })).rejects.toThrow(/seed/);
    await expect(render({ padding: 3.5 })).rejects.toThrow(/padding/);
    await expect(render({ accent: "orange" })).rejects.toThrow(/accent/);
    await expect(render({ pageColor: "red" })).rejects.toThrow(/#rrggbb/);
  });
});
