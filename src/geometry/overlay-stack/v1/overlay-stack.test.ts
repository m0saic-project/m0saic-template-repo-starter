import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { OverlayStackV1 } from "./overlay-stack";

describe("@m0saic-starter/geometry/overlay-stack/v1", () => {
  it("stacks base, band, and badge as three frames in walk order", async () => {
    const doc = asDocument(await OverlayStackV1.render({}, targetCtx(1280, 720)));
    expect(doc.m0).toBe("1{3[-,1{1},-]}");

    const ev = evaluateM0(doc.m0, { width: 1280, height: 720 });
    expect(ev.frameCount).toBe(3);

    // Binding order == walk order == paint order: base fill, band fill, badge text.
    expect(doc.sources?.map((s) => s.type)).toEqual(["lavfi", "lavfi", "text"]);
  });

  it("is deterministic", async () => {
    const a = await OverlayStackV1.render({}, targetCtx(1280, 720));
    const b = await OverlayStackV1.render({}, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      OverlayStackV1.render({ bandColor: "navy" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
