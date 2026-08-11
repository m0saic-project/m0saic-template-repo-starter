import { asDocument, targetCtx } from "../../../__testutils__/render";
import { TypedPropsTourV1 } from "./typed-props-tour";

describe("@m0saic-starter/props/typed-props-tour/v1", () => {
  it("every prop drives the document", async () => {
    const doc = asDocument(await TypedPropsTourV1.render({}, targetCtx(1280, 720)));
    // defaults: 4 tiles, accent on (marker row claims), align center.
    expect(doc.m0).toContain("4(1,1,1,1)");
    expect(doc.m0).toContain("3(-,1,-)");
    // title + marker + 4 tiles + caption
    expect(doc.sources).toHaveLength(7);
  });

  it("boolean off nulls the marker row and drops its source", async () => {
    const doc = asDocument(
      await TypedPropsTourV1.render({ accent: false }, targetCtx(1280, 720)),
    );
    expect(doc.m0).not.toContain("3(-,1,-)");
    expect(doc.sources).toHaveLength(6);
  });

  it("enum picks the marker's third", async () => {
    const left = asDocument(
      await TypedPropsTourV1.render({ align: "left" }, targetCtx(1280, 720)),
    );
    expect(left.m0).toContain("3(1,-,-)");
  });

  it("the caption is the receipt", async () => {
    const doc = asDocument(
      await TypedPropsTourV1.render({ title: "Hey", tiles: 2 }, targetCtx(1280, 720)),
    );
    const texts = (doc.sources ?? []).filter((s) => s.type === "text");
    const caption = JSON.stringify(texts[texts.length - 1]);
    expect(caption).toContain("tiles 2");
    expect(caption).toContain('title \\"Hey\\"');
  });

  it("render() is the gate", async () => {
    await expect(
      TypedPropsTourV1.render({ tiles: 9 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/integer 1-8/);
    await expect(
      TypedPropsTourV1.render({ align: "middle" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/left \| center \| right/);
    await expect(
      TypedPropsTourV1.render({ accent: "yes" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/boolean/);
  });
});
