import { getConnectionOptionImagesFetcher } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CardsPickerV1 } from "./cards-picker";

const render = (
  props: Parameters<typeof CardsPickerV1.render>[0] = {},
  w = 1280,
  h = 720,
) => CardsPickerV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

const meta = CardsPickerV1.propsSchema?.itemIds?.meta;

describe("@m0saic-starter/connections/cards-picker/v1", () => {
  it("declares the cards picker with connection-kind-owned shape and fit", () => {
    expect(meta?.control?.picker).toBe("cards");
    expect(meta?.control?.cardAspect).toBe("wide");
    expect(meta?.control?.cardFit).toBe("cover");
    expect(meta?.control?.optionsFromConnection).toEqual({
      kind: "starter-catalog-items",
      connectionFromProp: "connectionId",
    });
    // The lazy-art companion is really registered for that kind, and the
    // sibling wire ships with a working default.
    expect(getConnectionOptionImagesFetcher("starter-catalog-items")).toBeDefined();
    expect(CardsPickerV1.defaultProps?.connectionId).toBe("starter-catalog@default");
  });

  it("renders one poster card per picked id", async () => {
    const doc = await render({ itemIds: ["big-buck-bunny", "ember-glow"] });
    // per card: art tile + strip tile + label; plus the caption source
    expect(doc.sources).toHaveLength(2 * 3 + 1);
    const t = text(doc);
    expect(t).toContain("Big Buck Bunny");
    expect(t).toContain("Ember Glow");
    expect(t).toContain("CARDS PICKER - 2 items");
  });

  it("re-lays out from 1 through 6 cards", async () => {
    const one = await render({ itemIds: ["soft-gradient"] });
    expect(one.sources).toHaveLength(1 * 3 + 1);
    const six = await render({
      itemIds: ["a-1", "b-2", "c-3", "d-4", "e-5", "f-6"],
    });
    expect(six.sources).toHaveLength(6 * 3 + 1);
  });

  it("rejects empty, oversized, and non-slug id lists", async () => {
    await expect(render({ itemIds: [] })).rejects.toThrow(/1-6/);
    await expect(
      render({ itemIds: ["a", "b", "c", "d", "e", "f", "g"] }),
    ).rejects.toThrow(/1-6/);
    await expect(render({ itemIds: ["Nope!"] })).rejects.toThrow(/lowercase slug/);
  });

  it("is deterministic — same ids, same posters", async () => {
    const a = await render({ itemIds: ["harbor-drone-pass", "ink-in-water"] });
    const b = await render({ itemIds: ["harbor-drone-pass", "ink-in-water"] });
    expect(a).toEqual(b);
  });
});
