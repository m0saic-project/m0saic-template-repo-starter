import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { WeightedCardsV1, parseWeighted } from "./weighted-cards";

const render = (
  props: Parameters<typeof WeightedCardsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => WeightedCardsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/weighted-cards/v1", () => {
  it("declares the two-cells-one-array pair plus the inter-card sibling", () => {
    const meta = WeightedCardsV1.propsSchema?.mixes?.meta;
    const cols = meta?.control?.columns ?? [];
    expect(cols.map((c) => c.kind)).toEqual(["text", "connectionMultiSelect", "weights"]);
    // The weights column SHARES the multi-select's key — two cells, one array.
    expect(cols[1]?.key).toBe("itemIds");
    expect(cols[2]?.key).toBe("itemIds");
    expect(meta?.control?.interWeightProp).toBe("mixWeights");
    expect(WeightedCardsV1.propsSchema?.mixWeights?.type).toBe("number[]");
    expect(WeightedCardsV1.defaultProps?.connectionId).toBe("starter-catalog@default");
  });

  /** The duality contract: string[] and {id,weight}[] both arrive. */
  it("normalizes even string[] and customized {id,weight}[] cards alike", () => {
    const { mixes } = parseWeighted(
      [
        { label: "Even", itemIds: ["a-1", "b-2"] },
        { label: "Custom", itemIds: [{ id: "c-3", weight: 3 }, { id: "d-4", weight: 1 }] },
      ],
      [1, 1],
    );
    expect(mixes[0].items.map((i) => i.weight)).toEqual([0.5, 0.5]);
    expect(mixes[1].items.map((i) => i.weight)).toEqual([0.75, 0.25]);
  });

  it("renders rows from mixWeights and chips from item shares", async () => {
    const doc = await render(); // defaults: 2 mixes (3 + 2 chips), weights 2:1
    // per mix: plate tile + plate label; per chip: tile + label; + caption
    expect(doc.sources).toHaveLength(2 * 2 + 5 * 2 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("Feature 67%");
    expect(t).toContain("Loops 33%");
    expect(t).toContain("Big Buck Bunny 60%");
    expect(t).toContain("Ember Glow 50%");
  });

  it("rejects mismatched inter-card weights and malformed items", () => {
    expect(() => parseWeighted([{ label: "A", itemIds: ["x-1"] }], [1, 2])).toThrow(/one weight per mix/);
    expect(() => parseWeighted([{ label: "A", itemIds: ["x-1"] }], [0])).toThrow(/positive/);
    expect(() => parseWeighted([{ label: "A", itemIds: [{ id: "x-1", weight: -1 }] }], [1])).toThrow(/id string or/);
    expect(() => parseWeighted([{ label: "A", itemIds: ["Bad!"] }], [1])).toThrow(/lowercase slug/);
  });

  it("accepts mixes as a JSON string", async () => {
    const cards = [{ label: "Solo", itemIds: ["ember-glow"] }];
    expect(await render({ mixes: cards, mixWeights: [1] })).toEqual(
      await render({ mixes: JSON.stringify(cards), mixWeights: [1] }),
    );
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });

  it("stays above its safe minimum at its own 720p hint for ANY slider scale (a prime total once pinned it to 1303px)", async () => {
    // The inter-card sliders write percentages, ratios, or raw numbers; the
    // row split's slot total must not follow their scale.
    for (const mixWeights of [[2, 1], [58, 42], [32, 68], [320, 680], [1, 99], [50, 50]]) {
      const doc = await render({ mixWeights }, 1280, 720);
      const ev = evaluateM0(String(doc.m0), { width: 1280, height: 720 });
      expect(ev.recommendedMin.height).toBeLessThanOrEqual(720);
      expect(ev.recommendedMin.width).toBeLessThanOrEqual(1280);
      expect(ev.feasible && ev.meetsPrecision).toBe(true);
      expect(ev.precision.maxSplitY).toBeLessThanOrEqual(160);
    }
  });
});
