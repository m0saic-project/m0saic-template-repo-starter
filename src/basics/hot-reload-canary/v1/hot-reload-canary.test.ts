import type { MosaicTextSource } from "@m0saic/types";

import { asDocument, defaultCtx } from "../../../__testutils__/render";
import {
  CANARY_BLUE,
  CANARY_COLOR,
  CANARY_RED,
  HotReloadCanaryV1,
  canaryColorLabel,
} from "./hot-reload-canary";

function fillOf(source: MosaicTextSource): string {
  return JSON.stringify(source.visual?.backgroundColor ?? null);
}

describe("@m0saic-starter/basics/hot-reload-canary/v1", () => {
  it("pins the two canary constants", () => {
    expect(CANARY_RED).toBe("#c0392b");
    expect(CANARY_BLUE).toBe("#2471a3");
    expect([CANARY_RED, CANARY_BLUE]).toContain(CANARY_COLOR);
  });

  it("defaultProps deliberately has NO color key — the constant is the default", () => {
    // If someone "helpfully" adds `color` to defaultProps, the canary stops
    // proving reloads: the editor's stored prop bag would mask the constant.
    expect(Object.keys(HotReloadCanaryV1.defaultProps)).not.toContain("color");
  });

  it("renders the module constant when no override is given", async () => {
    const doc = asDocument(await HotReloadCanaryV1.render({}, defaultCtx));
    const source = doc.sources?.[0] as MosaicTextSource;
    expect(fillOf(source)).toContain(CANARY_COLOR);
    expect(source.layers[0]?.content).toEqual({
      kind: "literal",
      text: canaryColorLabel(CANARY_COLOR),
    });
  });

  it("honors an explicit override and fails fast on a malformed one", async () => {
    const doc = asDocument(
      await HotReloadCanaryV1.render({ color: "#123abc" }, defaultCtx),
    );
    expect(fillOf(doc.sources?.[0] as MosaicTextSource)).toContain("#123abc");

    await expect(
      HotReloadCanaryV1.render({ color: "red" }, defaultCtx),
    ).rejects.toThrow(/#rrggbb/);
  });
});
