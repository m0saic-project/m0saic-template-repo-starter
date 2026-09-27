import type { MosaicDocument } from "@m0saic/types";
import { resolvePropBindings } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import {
  BOUND_NUMBERS_DEFAULTS,
  BoundNumbersV1,
  drawPrice,
  drawTotal,
  drawVisitors,
  drawYear,
  honestSpellings,
} from "./bound-numbers";

const render = (
  props: Parameters<typeof BoundNumbersV1.render>[0] = {},
  w = 1280,
  h = 720,
) => BoundNumbersV1.render({ ...BOUND_NUMBERS_DEFAULTS, ...props }, targetCtx(w, h)).then(asDocument);
const resolve = (doc: MosaicDocument, w = 1280, h = 720) =>
  resolvePropBindings(doc, w, h, { propsSchema: BoundNumbersV1.propsSchema });
const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/make/bound-numbers/v1", () => {
  it("binds each drawn number to its prop - kind number, one rect each, nothing rejected", async () => {
    const { byProp, rejected } = resolve(await render());
    expect(rejected).toEqual([]);
    expect(Object.keys(byProp).sort()).toEqual(["price", "visitors", "year"]);
    for (const key of ["visitors", "price", "year"]) {
      expect(byProp[key]).toHaveLength(1);
      expect(byProp[key][0]).toMatchObject({ kind: "number" });
    }
  });

  it("⭐ draws each number in an honest spelling - the ones the gate reads", async () => {
    const t = text(await render());
    expect(t).toContain(drawVisitors(12480)); // "12,480"
    expect(t).toContain(drawPrice(3.5)); // "$3.50"
    expect(t).toContain(drawYear(2026)); // "2026"

    expect(honestSpellings(12480)).toContain("12,480");
    expect(honestSpellings(3.5)).toEqual(expect.arrayContaining(["3.5", "3.50"]));
    expect(honestSpellings(2026)).toContain("2026");
    // an integer never spells with decimals - "4.00" is not a spelling of 4
    expect(honestSpellings(4)).not.toContain("4.00");
  });

  it("the derived total is drawn but NOT bound - no prop is behind it", async () => {
    const doc = await render();
    expect(text(doc)).toContain(drawTotal(12480, 3.5)); // "$43,680.00"
    expect(resolve(doc).byProp.total).toBeUndefined();
  });

  it("the values reach the rects that bind them", async () => {
    const doc = await render({ visitors: 1200, price: 4, year: 1999 });
    const t = text(doc);
    expect(t).toContain("1,200");
    expect(t).toContain("$4.00");
    expect(t).toContain("1999");
    expect(Object.keys(resolve(doc).byProp).sort()).toEqual(["price", "visitors", "year"]);
  });

  it("render() is the gate", async () => {
    await expect(render({ visitors: -1 })).rejects.toThrow(/visitors/);
    await expect(render({ visitors: 1.5 })).rejects.toThrow(/visitors/);
    await expect(render({ price: Number.NaN })).rejects.toThrow(/price/);
    await expect(render({ year: 2026.5 })).rejects.toThrow(/year/);
    await expect(render({ pageColor: "red" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
