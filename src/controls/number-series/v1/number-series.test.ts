import { asDocument, targetCtx } from "../../../__testutils__/render";
import { NumberSeriesV1, parseSeries } from "./number-series";

const render = (
  props: Parameters<typeof NumberSeriesV1.render>[0] = {},
  w = 1280,
  h = 720,
) => NumberSeriesV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/number-series/v1", () => {
  it("declares the numberSeries flavor with a both-shapes schema", () => {
    const meta = NumberSeriesV1.propsSchema?.values?.meta;
    expect(meta?.control?.flavor).toBe("numberSeries");
    expect(meta?.constraints?.jsonSchema).toMatchObject({ oneOf: expect.any(Array) });
  });

  /** The round-trip contract: flat and nested arrive as the same data. */
  it("normalizes number[] and [number[]] identically", async () => {
    const flat = await render({ values: [5, 10, 15] });
    const nested = await render({ values: [[5, 10, 15]] });
    expect(flat).toEqual(nested);
    expect(text(flat)).toContain("flat number[]");
  });

  it("renders one bar per point per series against the shared max", async () => {
    const doc = await render({ values: [[10, 20], [30, 40, 50]] });
    // 2 + 3 bar tiles + caption
    expect(doc.sources).toHaveLength(5 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("2 series");
    expect(t).toContain("(50)"); // the shared maximum, named in the caption
  });

  it("parseSeries rejects malformed shapes", () => {
    expect(() => parseSeries([])).toThrow(/non-empty/);
    expect(() => parseSeries([[1]])).toThrow(/2-12 points/);
    expect(() => parseSeries([[1, -2]])).toThrow(/\[0, 9999\]/);
    expect(() => parseSeries([[1, 2], [3, 4], [5, 6], [7, 8]])).toThrow(/1-3 series/);
  });

  it("accepts the same value as a JSON string", async () => {
    expect(await render({ values: [[1, 2, 3]] })).toEqual(
      await render({ values: "[[1,2,3]]" }),
    );
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
