import { asDocument, targetCtx } from "../../../__testutils__/render";
import { MIX_LABELS, WeightsV1, parseMix } from "./weights";

const render = (
  props: Parameters<typeof WeightsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => WeightsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/weights/v1", () => {
  it("declares the weights flavor over the schema-owned label set", () => {
    const meta = WeightsV1.propsSchema?.mix?.meta;
    expect(meta?.control?.flavor).toBe("weights");
    expect(meta?.control?.weights).toEqual({ labels: MIX_LABELS });
    expect(meta?.constraints).toMatchObject({ minItems: 3, maxItems: 3 });
  });

  it("the bands ARE the weights — legend carries the percentages", async () => {
    const t = text(await render({ mix: [50, 30, 20] })).replace(/\\n/g, " ");
    expect(t).toContain("Footage 50%");
    expect(t).toContain("Titles 30%");
    expect(t).toContain("Breaks 20%");
  });

  /** The field's forgiving posture, mirrored at render. */
  it("normalizes hand-typed values that don't sum to 100", () => {
    expect(parseMix([3, 1, 1]).map(Math.round)).toEqual([60, 20, 20]);
    expect(parseMix([0, 0, 0]).map(Math.round)).toEqual([33, 33, 33]);
  });

  it("rejects wrong lengths and bad numbers — the label pairing is by order", () => {
    expect(() => parseMix([50, 50])).toThrow(/exactly 3/);
    expect(() => parseMix([50, 25, Number.NaN])).toThrow(/finite/);
    expect(() => parseMix([50, 25, -5])).toThrow(/non-negative/);
  });

  it("is deterministic", async () => {
    expect(await render({ mix: [40, 35, 25] })).toEqual(await render({ mix: [40, 35, 25] }));
  });
});
