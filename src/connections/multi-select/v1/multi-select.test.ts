import { asDocument, targetCtx } from "../../../__testutils__/render";
import { MultiSelectV1, parseMixes } from "./multi-select";

const render = (
  props: Parameters<typeof MultiSelectV1.render>[0] = {},
  w = 1280,
  h = 720,
) => MultiSelectV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

const meta = MultiSelectV1.propsSchema?.mixes?.meta;

describe("@m0saic-starter/connections/multi-select/v1", () => {
  it("declares cardList with a grouped connectionMultiSelect column", () => {
    expect(meta?.control?.flavor).toBe("cardList");
    const cols = meta?.control?.columns ?? [];
    expect(cols.map((c) => c.kind)).toEqual(["text", "connectionMultiSelect"]);
    expect(cols[1]).toMatchObject({
      optionsFromConnection: {
        kind: "starter-catalog-items",
        connectionFromProp: "connectionId",
      },
      groupByKey: "group",
    });
    expect(MultiSelectV1.defaultProps?.connectionId).toBe("starter-catalog@default");
    // Structured editors can also render the schema'd form.
    expect(meta?.constraints?.jsonSchema).toMatchObject({ type: "array" });
  });

  it("renders a label plate + chip per picked item, per card", async () => {
    const doc = await render(); // defaults: 2 mixes, 2 + 3 chips
    // per mix: plate tile + plate label; per chip: tile + label; + caption
    expect(doc.sources).toHaveLength(2 * 2 + 5 * 2 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("Opening");
    expect(t).toContain("Big Buck Bunny");
    expect(t).toContain("2 cards, 5 chips");
    expect(t).toContain("groupByKey");
  });

  it("accepts the same value as a JSON STRING — the editor-symmetry law", async () => {
    const asObjects = await render({
      mixes: [{ label: "Solo", itemIds: ["ember-glow"] }],
    });
    const asString = await render({
      mixes: JSON.stringify([{ label: "Solo", itemIds: ["ember-glow"] }]),
    });
    expect(asObjects).toEqual(asString);
  });

  it("parseMixes rejects malformed entries with named indexes", () => {
    expect(() => parseMixes([])).toThrow(/1-4 entries/);
    expect(() => parseMixes([{ label: "", itemIds: ["a"] }])).toThrow(/mixes\[0\]\.label/);
    expect(() => parseMixes([{ label: "ok", itemIds: [] }])).toThrow(/mixes\[0\]\.itemIds/);
    expect(() => parseMixes([{ label: "ok", itemIds: ["Bad!"] }])).toThrow(/lowercase slug/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
