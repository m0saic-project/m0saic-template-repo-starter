import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RenderCoverV1 } from "./render-cover";

const ctx = targetCtx(1280, 720);

const real = (props: Parameters<typeof RenderCoverV1.render>[0]) =>
  RenderCoverV1.render(props, ctx).then(asDocument);

const cover = (props: Parameters<typeof RenderCoverV1.render>[0] = {}) => {
  const fn = RenderCoverV1.renderCover;
  if (typeof fn !== "function") throw new Error("renderCover must be declared");
  return asDocument(fn(props, ctx) as never);
};

describe("@m0saic-starter/surfaces/render-cover/v1", () => {
  it("declares the cover surface", () => {
    expect(typeof RenderCoverV1.renderCover).toBe("function");
  });

  it("render stays STRICT with no clip — the contract the cover protects", async () => {
    const doc = await real({});
    // It renders (exit clean, no throw) and names the remedy.
    const text = JSON.stringify(doc);
    expect(text).toContain("clip is required");
  });

  it("render uses the clip when it has one", async () => {
    const doc = await real({ clip: "/tmp/starter/demo.mp4" });
    const assetPaths = Object.values(doc.assets ?? {}).map((a) =>
      JSON.stringify(a),
    );
    expect(assetPaths.join()).toContain("/tmp/starter/demo.mp4");
    expect(JSON.stringify(doc.sources)).toContain('"mediaType":"video"');
  });

  it("the cover is real geometry — three carved bands, not floating text", () => {
    const doc = cover();
    // [3,2,1] weights: each child is (w-1) forward-donating "0" tokens then
    // its claimant, so the bands land at slots 2, 4 and 5.
    expect(doc.m0).toBe("6[0,0,1{1},0,1{1},1{1}]");
    // Three bands, each a fill plus its attached copy.
    expect(doc.sources).toHaveLength(6);
  });

  it("the cover ignores props — at cover time the working props ARE defaults", () => {
    const bare = cover({});
    const dressed = cover({ clip: "/tmp/x.mp4", accentColor: "#ff0000" });
    expect(dressed).toEqual(bare);
  });

  it("the cover never depends on ctx.media", () => {
    // targetCtx supplies an empty registry, exactly as both hosts do. If the
    // cover reached for a probe this would throw or come back different.
    expect(() => cover()).not.toThrow();
  });

  it("cover copy is ASCII — the bundled glyph font draws the rest as tofu", () => {
    const text = JSON.stringify(cover());
    expect(/[^\x00-\x7F]/.test(text)).toBe(false);
  });

  it("is deterministic", async () => {
    const a = await real({ clip: "/tmp/starter/demo.mp4" });
    const b = await real({ clip: "/tmp/starter/demo.mp4" });
    expect(a).toEqual(b);
  });
});
