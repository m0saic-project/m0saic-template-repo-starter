import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RowEditorsV1, SEGMENT_PALETTE, parseSegments } from "./row-editors";

const render = (
  props: Parameters<typeof RowEditorsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => RowEditorsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/row-editors/v1", () => {
  it("declares objectRows with typed columns and a seeding palette", () => {
    const meta = RowEditorsV1.propsSchema?.segments?.meta;
    expect(meta?.control?.flavor).toBe("objectRows");
    expect((meta?.control?.columns ?? []).map((c) => c.kind)).toEqual(["text", "number", "color"]);
    expect(meta?.control?.palette).toEqual(SEGMENT_PALETTE);
    expect(meta?.constraints?.jsonSchema).toMatchObject({ type: "array" });
  });

  it("renders one bar band + legend entry per row, with percentages", async () => {
    const doc = await render({
      segments: [
        { label: "Build", value: 3 },
        { label: "Test", value: 1 },
      ],
    });
    // bar tiles (2) + legend x (chip + label) (4) + caption
    expect(doc.sources).toHaveLength(2 + 4 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("Build 75%");
    expect(t).toContain("Test 25%");
  });

  it("accepts the same value as a JSON string — editor symmetry", async () => {
    const rows = [
      { label: "A", value: 2 },
      { label: "B", value: 2 },
    ];
    expect(await render({ segments: rows })).toEqual(
      await render({ segments: JSON.stringify(rows) }),
    );
  });

  it("row colors: explicit wins, palette fills the rest", async () => {
    const doc = await render({
      segments: [
        { label: "A", value: 1, color: "#123456" },
        { label: "B", value: 1 },
      ],
    });
    const t = text(doc);
    expect(t).toContain("#123456");
    expect(t).toContain(SEGMENT_PALETTE[1]);
  });

  it("parseSegments rejects malformed rows with named indexes", () => {
    expect(() => parseSegments([{ label: "solo", value: 1 }])).toThrow(/2-6 rows/);
    expect(() => parseSegments([{ label: "", value: 1 }, { label: "b", value: 1 }])).toThrow(/segments\[0\]\.label/);
    expect(() => parseSegments([{ label: "a", value: 0 }, { label: "b", value: 1 }])).toThrow(/segments\[0\]\.value/);
    expect(() => parseSegments([{ label: "a", value: 1, color: "red" }, { label: "b", value: 1 }])).toThrow(/color/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
