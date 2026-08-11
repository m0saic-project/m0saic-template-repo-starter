import { asDocument, targetCtx } from "../../../__testutils__/render";
import { SeededShuffleV1 } from "./seeded-shuffle";

describe("@m0saic-starter/props/seeded-shuffle/v1", () => {
  it("same seed, same bytes", async () => {
    const a = await SeededShuffleV1.render({ seed: 42 }, targetCtx(1280, 720));
    const b = await SeededShuffleV1.render({ seed: 42 }, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });

  it("different seed, different deal", async () => {
    const a = asDocument(await SeededShuffleV1.render({ seed: 1 }, targetCtx(1280, 720)));
    const b = asDocument(await SeededShuffleV1.render({ seed: 2 }, targetCtx(1280, 720)));
    expect(JSON.stringify(a.sources)).not.toBe(JSON.stringify(b.sources));
  });

  it("deals tiles + caption in a strip-over-band layout", async () => {
    const doc = asDocument(
      await SeededShuffleV1.render({ seed: 7, tiles: 6 }, targetCtx(1280, 720)),
    );
    expect(doc.m0).toContain("6(1,1,1,1,1,1)");
    expect(doc.sources).toHaveLength(7); // 6 tiles + caption
  });

  it("the seed is REQUIRED — render() throws with a remedy", async () => {
    await expect(
      SeededShuffleV1.render({}, targetCtx(1280, 720)),
    ).rejects.toThrow(/seed is REQUIRED/);
    await expect(
      SeededShuffleV1.render({ seed: 1.5 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/seed is REQUIRED/);
  });
});
