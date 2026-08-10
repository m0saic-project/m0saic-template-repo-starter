import type { MosaicTextSource } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";

import { asDocument, defaultCtx } from "../../../__testutils__/render";
import { HelloWorldV1 } from "./hello-world";

type Maskish = { mask?: { kind?: string; localPath?: string } };

describe("@m0saic-starter/basics/hello-world/v1", () => {
  it("renders the brand hello: backdrop, square M, greeting", async () => {
    const doc = asDocument(
      await HelloWorldV1.render({ ...HelloWorldV1.defaultProps }, defaultCtx),
    );

    expect(doc.kind).toBe("mosaic_document");
    expect(doc.version).toBe(1);
    expect(doc.sources).toHaveLength(3);

    // placeInsetPieces orders sources by IMPORTANCE ascending (paint order —
    // higher importance paints later, on top): backdrop, greeting, then the
    // M (a color tile WEARING the baked glyph as an inline-mask).
    const [backdrop, greeting, glyph] = doc.sources as [Maskish, MosaicTextSource, Maskish];
    expect((backdrop as { type?: string }).type).toBe("lavfi");
    expect(greeting.type).toBe("text");
    expect(greeting.layers[0]?.content).toEqual({
      kind: "literal",
      text: "Hello, m0saic",
    });
    expect(glyph.mask?.kind).toBe("inline-mask");
    expect(glyph.mask?.localPath?.length ?? 0).toBeGreaterThan(50);
  });

  it("trivia the curriculum leans on: 'F' canonicalizes to '1'", () => {
    // The simplest possible m0 is one full-canvas rect, spelled "F" — and
    // what ships is always canonical: the canonicalizer reduces every
    // spelling of a full-canvas frame to "1".
    expect(String(toM0String("F", "test"))).toBe("1");
  });

  it("renders custom text", async () => {
    const doc = asDocument(await HelloWorldV1.render({ text: "Salut" }, defaultCtx));
    const greeting = doc.sources?.[1] as MosaicTextSource;
    expect(greeting.layers[0]?.content).toEqual({ kind: "literal", text: "Salut" });
  });

  it("renders the same three-piece shape at landscape and portrait", async () => {
    // The M's square side comes from min(width, height) of ctx.target, so
    // both orientations must place all three pieces cleanly.
    for (const [w, h] of [
      [1280, 720],
      [720, 1280],
    ] as const) {
      const doc = asDocument(
        await HelloWorldV1.render(
          {},
          { ...defaultCtx, target: { ...defaultCtx.target, width: w, height: h } },
        ),
      );
      expect(doc.sources).toHaveLength(3);
      expect((doc.sources?.[2] as Maskish).mask?.kind).toBe("inline-mask");
    }
  });

  it("is deterministic — identical props, identical document", async () => {
    const a = await HelloWorldV1.render({ text: "same" }, defaultCtx);
    const b = await HelloWorldV1.render({ text: "same" }, defaultCtx);
    expect(a).toEqual(b);
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      HelloWorldV1.render({ backgroundColor: "blue" }, defaultCtx),
    ).rejects.toThrow(/backgroundColor .* #rrggbb/);
  });
});
