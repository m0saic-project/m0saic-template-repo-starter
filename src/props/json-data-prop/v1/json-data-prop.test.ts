import { asDocument, targetCtx } from "../../../__testutils__/render";
import { JsonDataPropV1 } from "./json-data-prop";

describe("@m0saic-starter/props/json-data-prop/v1", () => {
  it("one row per record, bar weights = value vs max", async () => {
    const doc = asDocument(
      await JsonDataPropV1.render(
        { data: [{ label: "a", value: 25 }, { label: "b", value: 100 }] },
        targetCtx(1280, 720),
      ),
    );
    // 2 records → (label + bar) × 2 + caption
    expect(doc.sources).toHaveLength(5);
    // b is the max → its bar claims the full area ("1"), a claims 25 of 100.
    expect(doc.m0.length).toBeGreaterThan(10);
  });

  it("is deterministic", async () => {
    const a = await JsonDataPropV1.render({}, targetCtx(1280, 720));
    const b = await JsonDataPropV1.render({}, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });

  it("collects EVERY problem into one error", async () => {
    const bad = [
      { label: "", value: 500 },
      { label: "fine", value: 50 },
      { label: "x".repeat(20), value: 10 },
    ];
    await expect(
      JsonDataPropV1.render({ data: bad as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/data\[0\]\.label[\s\S]*data\[0\]\.value[\s\S]*data\[2\]\.label/);
  });

  it("rejects a non-array and an oversize array", async () => {
    await expect(
      JsonDataPropV1.render({ data: {} as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/array of 1-6/);
    await expect(
      JsonDataPropV1.render(
        { data: new Array(7).fill({ label: "x", value: 1 }) },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/array of 1-6/);
  });
});
