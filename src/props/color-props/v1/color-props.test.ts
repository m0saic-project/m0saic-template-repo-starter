import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ColorPropsV1 } from "./color-props";

describe("@m0saic-starter/props/color-props/v1", () => {
  it("panel + one band per palette entry + caption", async () => {
    const doc = asDocument(await ColorPropsV1.render({}, targetCtx(1280, 720)));
    expect(doc.sources).toHaveLength(1 + 4 + 1);
    expect(doc.m0).toContain("4[1,1,1,1]");
  });

  it("the palette length drives the column split", async () => {
    const doc = asDocument(
      await ColorPropsV1.render(
        { palette: ["#111111", "#222222"] },
        targetCtx(1280, 720),
      ),
    );
    expect(doc.m0).toContain("2[1,1]");
    expect(doc.sources).toHaveLength(1 + 2 + 1);
  });

  it("a one-color palette is a full column, not an illegal 1-split", async () => {
    const doc = asDocument(
      await ColorPropsV1.render({ palette: ["#123456"] }, targetCtx(1280, 720)),
    );
    expect(doc.m0).not.toContain("1[1]");
    expect(doc.sources).toHaveLength(3);
  });

  it("fails fast on bad colors, scalar or list entry", async () => {
    await expect(
      ColorPropsV1.render({ panelColor: "blue" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
    await expect(
      ColorPropsV1.render({ palette: ["#123456", "nope"] }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
    await expect(
      ColorPropsV1.render({ palette: [] }, targetCtx(1280, 720)),
    ).rejects.toThrow(/1-8 colors/);
  });
});
