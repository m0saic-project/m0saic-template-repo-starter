import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RangeV1, parseHold } from "./range";

const render = (
  props: Parameters<typeof RangeV1.render>[0] = {},
  w = 1280,
  h = 720,
) => RangeV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/range/v1", () => {
  it("declares the range flavor with its toggles and bounds", () => {
    const meta = RangeV1.propsSchema?.hold?.meta;
    expect(meta?.control?.flavor).toBe("range");
    expect(meta?.control?.range).toMatchObject({
      collapsible: true,
      allowOnce: true,
      onceLabel: "Pick once per render",
      min: 1,
      max: 10,
    });
  });

  it("normalizes the three legal shapes", () => {
    expect(parseHold(4)).toEqual({ intent: "flat", value: 4 });
    expect(parseHold({ low: 3, high: 6 })).toEqual({ intent: "range", low: 3, high: 6, once: false });
    expect(parseHold({ low: 3, high: 6, once: true })).toEqual({ intent: "range", low: 3, high: 6, once: true });
  });

  it("once is true or ABSENT — never false on the wire", () => {
    expect(() => parseHold({ low: 3, high: 6, once: false as never })).toThrow(/never false/);
  });

  it("renders each intent distinctly", async () => {
    expect(text(await render({ hold: 5 }))).toContain("hold exactly 5s");
    expect(text(await render({ hold: { low: 2, high: 8 } }))).toContain("fresh per slide");
    expect(text(await render({ hold: { low: 2, high: 8, once: true } }))).toContain("picked once, then reused");
  });

  it("rejects malformed values", () => {
    expect(() => parseHold({ low: 8, high: 2 })).toThrow(/must not exceed/);
    expect(() => parseHold(0)).toThrow(/\[1, 10\]/);
    expect(() => parseHold("4" as never)).toThrow(/number or/);
  });

  it("is deterministic", async () => {
    expect(await render({ hold: { low: 3, high: 6 } })).toEqual(await render({ hold: { low: 3, high: 6 } }));
  });
});
